const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const pool = require("../config/database");

const execFileAsync = promisify(execFile);
const backendDir = path.resolve(__dirname, "../../");
const pythonExe = path.join(
  backendDir,
  "emotion-venv",
  "Scripts",
  "python.exe"
);

const emotionScript = path.join(
  backendDir,
  "python",
  "test_audio_emotion.py"
);

const toneScript = path.join(
  backendDir,
  "python",
  "analyze_audio_tone.py"
);

function parseJsonOutput(stdout) {
  const text = String(stdout || "");
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace < firstBrace) {
    throw new Error("Python analysis did not return valid JSON.");
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

async function analyzeRecordingAudio(req, res) {
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
        message: "The audio emotion environment is not configured.",
      });
    }

    const options = {
      timeout: 600000,
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true,
    };

    const [emotionResult, toneResult] = await Promise.all([
      execFileAsync(pythonExe, [emotionScript, audioPath], options),
      execFileAsync(pythonExe, [toneScript, audioPath], options),
    ]);

    const emotionAnalysis = parseJsonOutput(emotionResult.stdout);
    const toneAnalysis = parseJsonOutput(toneResult.stdout);

    const emotionModel =
      emotionAnalysis.model || "Dpngtm/wav2vec2-emotion-recognition";

    const saved = await pool.query(
      `INSERT INTO recording_audio_analysis (
         recording_id,
         emotion_analysis,
         tone_analysis,
         emotion_model,
         analysis_version
       )
       VALUES ($1, $2::jsonb, $3::jsonb, $4, 1)
       ON CONFLICT (recording_id)
       DO UPDATE SET
         emotion_analysis = EXCLUDED.emotion_analysis,
         tone_analysis = EXCLUDED.tone_analysis,
         emotion_model = EXCLUDED.emotion_model,
         analysis_version =
           recording_audio_analysis.analysis_version + 1,
         updated_at = NOW()
       RETURNING recording_id, emotion_analysis, tone_analysis,
                 emotion_model, analysis_version, created_at, updated_at`,
      [
        id,
        JSON.stringify(emotionAnalysis),
        JSON.stringify(toneAnalysis),
        emotionModel,
      ]
    );

    return res.json({
      message: "Audio analysis completed.",
      data: saved.rows[0],
    });
  } catch (error) {
    console.error("Audio analysis failed:", error.message);

    if (error.killed || error.code === "ETIMEDOUT") {
      return res.status(504).json({
        message: "Audio analysis timed out. Try a shorter recording.",
      });
    }

    return res.status(500).json({
      message: "Failed to analyze the recording audio.",
    });
  }
}

async function getRecordingAudioAnalysis(req, res) {
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
      `SELECT recording_id, emotion_analysis, tone_analysis,
              emotion_model, analysis_version, created_at, updated_at
       FROM recording_audio_analysis
       WHERE recording_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No audio analysis saved for this recording yet.",
      });
    }

    return res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Loading audio analysis failed:", error.message);

    return res.status(500).json({
      message: "Failed to load audio analysis.",
    });
  }
}

module.exports = {
  analyzeRecordingAudio,
  getRecordingAudioAnalysis,
};
