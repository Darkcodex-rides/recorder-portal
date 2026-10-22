const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const pool = require("../config/database");

const execFileAsync = promisify(execFile);
const backendDir = path.resolve(__dirname, "../../");

const pythonExe = path.join(
  backendDir,
  "sentiment-venv",
  "Scripts",
  "python.exe"
);

const sentimentScript = path.join(
  backendDir,
  "python",
  "analyze_audio_sentiment.py"
);

function parseJsonOutput(stdout) {
  const text = String(stdout || "");
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace < firstBrace) {
    throw new Error("Sentiment analysis did not return valid JSON.");
  }

  return JSON.parse(text.slice(firstBrace, lastBrace + 1));
}

function getRecordingId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function getOwnedRecording(id, userId) {
  const result = await pool.query(
    `SELECT id, name, file_path
     FROM recordings
     WHERE id = $1
       AND user_id = $2
       AND deleted_at IS NULL`,
    [id, userId]
  );

  return result.rows[0] || null;
}

function resolveAudioPath(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return null;
  }

  return path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(backendDir, filePath);
}

async function analyzeRecordingSentiment(req, res) {
  const id = getRecordingId(req.params.id);

  if (!id) {
    return res.status(400).json({
      message: "A valid recording ID is required.",
    });
  }

  try {
    const recording = await getOwnedRecording(id, req.user.id);

    if (!recording) {
      return res.status(404).json({
        message: "Recording not found.",
      });
    }

    const audioPath = resolveAudioPath(recording.file_path);

    if (!audioPath || !fs.existsSync(audioPath)) {
      return res.status(404).json({
        message: "The recording audio file could not be found.",
      });
    }

    if (!fs.existsSync(pythonExe)) {
      return res.status(500).json({
        message: "The audio sentiment Python environment is not configured.",
      });
    }

    if (!fs.existsSync(sentimentScript)) {
      return res.status(500).json({
        message: "The audio sentiment analysis script could not be found.",
      });
    }

    const { stdout } = await execFileAsync(
      pythonExe,
      [sentimentScript, audioPath],
      {
        timeout: 600000,
        maxBuffer: 10 * 1024 * 1024,
        windowsHide: true,
      }
    );

    const sentimentAnalysis = parseJsonOutput(stdout);

    if (
      !Array.isArray(sentimentAnalysis.segments) ||
      sentimentAnalysis.segments.length === 0
    ) {
      throw new Error("The sentiment model returned no usable segments.");
    }

    const sentimentModel =
      sentimentAnalysis.model || "audeering/wav2small";

    const saved = await pool.query(
      `INSERT INTO recording_audio_sentiment (
         recording_id,
         sentiment_analysis,
         sentiment_model,
         analysis_version
       )
       VALUES ($1, $2::jsonb, $3, 1)
       ON CONFLICT (recording_id)
       DO UPDATE SET
         sentiment_analysis = EXCLUDED.sentiment_analysis,
         sentiment_model = EXCLUDED.sentiment_model,
         analysis_version =
           recording_audio_sentiment.analysis_version + 1,
         updated_at = NOW()
       RETURNING recording_id, sentiment_analysis, sentiment_model,
                 analysis_version, created_at, updated_at`,
      [id, JSON.stringify(sentimentAnalysis), sentimentModel]
    );

    return res.json({
      message: "Audio sentiment analysis completed.",
      data: saved.rows[0],
    });
  } catch (error) {
    console.error("Audio sentiment analysis failed:", error.message);

    if (error.killed || error.code === "ETIMEDOUT") {
      return res.status(504).json({
        message: "Audio sentiment analysis timed out. Try a shorter recording.",
      });
    }

    return res.status(500).json({
      message: "Failed to analyze the recording's audio sentiment.",
    });
  }
}

async function getRecordingAudioSentiment(req, res) {
  const id = getRecordingId(req.params.id);

  if (!id) {
    return res.status(400).json({
      message: "A valid recording ID is required.",
    });
  }

  try {
    const recording = await getOwnedRecording(id, req.user.id);

    if (!recording) {
      return res.status(404).json({
        message: "Recording not found.",
      });
    }

    const result = await pool.query(
      `SELECT recording_id, sentiment_analysis, sentiment_model,
              analysis_version, created_at, updated_at
       FROM recording_audio_sentiment
       WHERE recording_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No audio sentiment analysis saved for this recording yet.",
      });
    }

    return res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Loading audio sentiment failed:", error.message);

    return res.status(500).json({
      message: "Failed to load audio sentiment analysis.",
    });
  }
}

module.exports = {
  analyzeRecordingSentiment,
  getRecordingAudioSentiment,
};
