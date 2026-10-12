const pool = require("../config/database");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

const { execFile } = require("child_process");


async function getRecordings(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        duration,
        file_name,
        mime_type,
        file_size,
        created_at
      FROM recordings
      WHERE user_id = $1
  AND deleted_at IS NULL
ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error("Failed to fetch recordings", {
      error: error.message,
      userId: req.user.id,
    });

    res.status(500).json({
      success: false,
      message: "Failed to fetch recordings",
    });
  }
}

async function createRecording(req, res) {
  try {
    const {
      name,
      duration,
      fileName,
      filePath,
      mimeType,
      fileSize,
    } = req.body;

    const normalizedName = name?.trim();

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "Recording name is required",
      });
    }

    const recordingDuration =
      Number(duration) || 0;

    if (recordingDuration < 0) {
      return res.status(400).json({
        success: false,
        message: "Recording duration cannot be negative",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO recordings (
        user_id,
        name,
        duration,
        file_name,
        file_path,
        mime_type,
        file_size
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        req.user.id,
        normalizedName,
        recordingDuration,
        fileName || null,
        filePath || null,
        mimeType || null,
        fileSize || null,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error("Failed to create recording", {
      error: error.message,
      userId: req.user.id,
    });

    res.status(500).json({
      success: false,
      message: "Failed to create recording",
    });
  }
}

async function getRecordingById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        duration,
        file_name,
        mime_type,
        file_size,
        created_at
      FROM recordings
      WHERE id = $1
        AND user_id = $2
        AND deleted_at IS NULL
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error("Failed to fetch recording", {
      error: error.message,
      recordingId: req.params.id,
      userId: req.user.id,
    });

    res.status(500).json({
      success: false,
      message: "Failed to fetch recording",
    });
  }
}

async function deleteRecording(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE recordings
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND user_id = $2
        AND deleted_at IS NULL
      RETURNING
        id,
        name,
        duration,
        file_name,
        mime_type,
        file_size,
        created_at,
        deleted_at
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    const deletedRecording = result.rows[0];

    logger.info("Recording moved to trash", {
      recordingId: deletedRecording.id,
      userId: req.user.id,
      name: deletedRecording.name,
    });

    return res.json({
      success: true,
      message: "Recording moved to trash",
      data: deletedRecording,
    });
  } catch (error) {
    logger.error("Failed to move recording to trash", {
      error: error.message,
      recordingId: req.params.id,
      userId: req.user.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to move recording to trash",
    });
  }
}


async function getTrashedRecordings(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        duration,
        file_name,
        mime_type,
        file_size,
        created_at,
        deleted_at
      FROM recordings
      WHERE user_id = $1
        AND deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
      `,
      [req.user.id]
    );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error("Failed to fetch trashed recordings", {
      error: error.message,
      userId: req.user.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trashed recordings",
    });
  }
}

async function restoreRecording(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE recordings
      SET deleted_at = NULL
      WHERE id = $1
        AND user_id = $2
        AND deleted_at IS NOT NULL
      RETURNING
        id,
        name,
        duration,
        file_name,
        mime_type,
        file_size,
        created_at,
        deleted_at
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trashed recording not found",
      });
    }

    const restoredRecording = result.rows[0];

    logger.info("Recording restored from trash", {
      recordingId: restoredRecording.id,
      userId: req.user.id,
      name: restoredRecording.name,
    });

    return res.json({
      success: true,
      message: "Recording restored successfully",
      data: restoredRecording,
    });
  } catch (error) {
    logger.error("Failed to restore recording", {
      error: error.message,
      recordingId: req.params.id,
      userId: req.user.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to restore recording",
    });
  }
}



async function renameRecording(req, res) {
  try {
    const { id } = req.params;
    const normalizedName = req.body.name?.trim();

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "Recording name is required",
      });
    }

    if (normalizedName.length > 255) {
      return res.status(400).json({
        success: false,
        message:
          "Recording name cannot exceed 255 characters",
      });
    }

    const result = await pool.query(
      `
      UPDATE recordings
      SET name = $1
      WHERE id = $2
        AND user_id = $3
      RETURNING
        id,
        name,
        duration,
        file_name,
        mime_type,
        file_size,
        created_at
      `,
      [
        normalizedName,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    const renamedRecording = result.rows[0];

    logger.info("Recording renamed", {
      recordingId: renamedRecording.id,
      userId: req.user.id,
      name: renamedRecording.name,
    });

    return res.json({
      success: true,
      message: "Recording renamed successfully",
      data: renamedRecording,
    });
  } catch (error) {
    logger.error("Failed to rename recording", {
      error: error.message,
      recordingId: req.params.id,
      userId: req.user.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to rename recording",
    });
  }
}


async function uploadRecording(req, res) {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required",
      });
    }

    uploadedFilePath = req.file.path;

    const { name, duration } = req.body;

    const recordingName =
      name?.trim() || req.file.originalname;

    const recordingDuration =
      Number(duration) || 0;

    if (recordingDuration < 0) {
      await fs.promises.unlink(
        uploadedFilePath
      );

      return res.status(400).json({
        success: false,
        message: "Recording duration cannot be negative",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO recordings (
        user_id,
        name,
        duration,
        file_name,
        file_path,
        mime_type,
        file_size
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        req.user.id,
        recordingName,
        recordingDuration,
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.file.size,
      ]
    );

    logger.info("Recording uploaded", {
      recordingId: result.rows[0].id,
      userId: req.user.id,
      name: result.rows[0].name,
      fileSize: result.rows[0].file_size,
    });

    res.status(201).json({
      success: true,
      message: "Recording uploaded successfully",
      data: result.rows[0],
    });
  } catch (error) {
    logger.error("Failed to upload recording", {
      error: error.message,
      userId: req.user.id,
    });

    // Clean up uploaded file if database insertion fails
    if (uploadedFilePath) {
      try {
        await fs.promises.unlink(
          uploadedFilePath
        );
      } catch (cleanupError) {
        logger.error(
          "Failed to clean up uploaded file",
          {
            error: cleanupError.message,
            filePath: uploadedFilePath,
          }
        );
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload recording",
    });
  }
}


async function convertRecording(req, res) {
  let outputPath = null;

  try {
    const { id } = req.params;
    const format = String(req.body.format || "").toLowerCase();

    if (!["wav", "mp3"].includes(format)) {
      return res.status(400).json({
        success: false,
        message: "Format must be wav or mp3",
      });
    }

    const result = await pool.query(
      `SELECT id, name, duration, file_path, file_name
       FROM recordings
       WHERE id = $1
         AND user_id = $2
         AND deleted_at IS NULL`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    const source = result.rows[0];

    if (!source.file_path || !fs.existsSync(source.file_path)) {
      return res.status(404).json({
        success: false,
        message: "Source audio file not found",
      });
    }

    const recordingsDir = path.resolve(__dirname, "../../recordings");
    await fs.promises.mkdir(recordingsDir, { recursive: true });

    const outputName =
      `${Date.now()}-${require("crypto").randomUUID()}.${format}`;

    outputPath = path.join(recordingsDir, outputName);

    await new Promise((resolve, reject) => {
      const args = ["-nostdin", "-y", "-i", source.file_path];

      if (format === "mp3") {
        args.push("-vn", "-codec:a", "libmp3lame", "-q:a", "2");
      } else {
        args.push("-vn", "-codec:a", "pcm_s16le", "-ar", "44100");
      }

      args.push(outputPath);

      execFile("ffmpeg", args, { timeout: 120000 }, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    const stats = await fs.promises.stat(outputPath);

    const inserted = await pool.query(
      `INSERT INTO recordings
       (user_id, name, duration, file_name, file_path, mime_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, duration, file_name, mime_type, file_size, created_at`,
      [
        req.user.id,
        `${source.name} (${format.toUpperCase()})`,
        source.duration,
        outputName,
        outputPath,
        format === "mp3" ? "audio/mpeg" : "audio/wav",
        stats.size,
      ]
    );

    logger.info("Recording converted", {
      sourceRecordingId: source.id,
      convertedRecordingId: inserted.rows[0].id,
      format,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: `Recording converted to ${format.toUpperCase()}`,
      data: inserted.rows[0],
    });
  } catch (error) {
    if (outputPath) {
      try {
        await fs.promises.unlink(outputPath);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          logger.error("Failed to clean up converted audio", {
            error: cleanupError.message,
          });
        }
      }
    }

    logger.error("Failed to convert recording", {
      error: error.message,
      recordingId: req.params.id,
      userId: req.user.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to convert recording. Check that FFmpeg is available and the source file is valid.",
    });
  }
}


async function trimRecording(req, res) {
  let outputPath = null;

  try {
    const { id } = req.params;
    const startTime = Number(req.body.startTime);
    const endTime = Number(req.body.endTime);

    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      startTime < 0 ||
      endTime <= startTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid start and end time.",
      });
    }

    const result = await pool.query(
      `SELECT id, name, duration, file_path, file_name
       FROM recordings
       WHERE id = $1
         AND user_id = $2
         AND deleted_at IS NULL`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    const source = result.rows[0];

    if (!source.file_path || !fs.existsSync(source.file_path)) {
      return res.status(404).json({
        success: false,
        message: "Source audio file not found",
      });
    }

    const sourceDuration = Number(source.duration);

    if (
      !Number.isFinite(sourceDuration) ||
      sourceDuration <= 0 ||
      endTime > sourceDuration
    ) {
      return res.status(400).json({
        success: false,
        message: "End time must not exceed the recording duration.",
      });
    }

    const recordingsDir = path.resolve(
      __dirname,
      "../../recordings"
    );

    await fs.promises.mkdir(recordingsDir, {
      recursive: true,
    });

    const outputName =
      `${Date.now()}-${require("crypto").randomUUID()}-trimmed.wav`;

    outputPath = path.join(recordingsDir, outputName);

    const segmentDuration = endTime - startTime;

    await new Promise((resolve, reject) => {
      const args = [
        "-nostdin",
        "-y",
        "-ss",
        String(startTime),
        "-i",
        source.file_path,
        "-t",
        String(segmentDuration),
        "-vn",
        "-codec:a",
        "pcm_s16le",
        "-ar",
        "44100",
        outputPath,
      ];

      execFile(
        "ffmpeg",
        args,
        { timeout: 120000 },
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });

    const stats = await fs.promises.stat(outputPath);

    const inserted = await pool.query(
      `INSERT INTO recordings
       (user_id, name, duration, file_name, file_path, mime_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, duration, file_name, mime_type, file_size, created_at`,
      [
        req.user.id,
        `${source.name} (Trimmed)`,
        Math.round(segmentDuration),
        outputName,
        outputPath,
        "audio/wav",
        stats.size,
      ]
    );

    logger.info("Recording trimmed", {
      sourceRecordingId: source.id,
      trimmedRecordingId: inserted.rows[0].id,
      startTime,
      endTime,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Recording trimmed successfully",
      data: inserted.rows[0],
    });
  } catch (error) {
    if (outputPath) {
      try {
        await fs.promises.unlink(outputPath);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          logger.error("Failed to clean up trimmed audio", {
            error: cleanupError.message,
          });
        }
      }
    }

    logger.error("Failed to trim recording", {
      error: error.message,
      recordingId: req.params.id,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to trim recording",
    });
  }
}



async function transcribeRecording(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const recordingResult = await pool.query(
      `
      SELECT id, name, file_path
      FROM recordings
      WHERE id = $1
        AND user_id = $2
        AND deleted_at IS NULL
      `,
      [id, userId]
    );

    if (recordingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    const recording = recordingResult.rows[0];

    // Return the saved transcript without running Whisper again.
    const savedResult = await pool.query(
      `
      SELECT
        id,
        language,
        language_probability,
        transcript_text,
        segments
      FROM recording_transcripts
      WHERE recording_id = $1
      `,
      [recording.id]
    );

    if (savedResult.rows.length > 0) {
      const saved = savedResult.rows[0];

      return res.json({
        success: true,
        data: {
          recordingId: recording.id,
          recordingName: recording.name,
          language: saved.language,
          languageProbability: saved.language_probability,
          text: saved.transcript_text,
          segments: saved.segments,
        },
      });
    }

    if (
      !recording.file_path ||
      !fs.existsSync(recording.file_path)
    ) {
      return res.status(404).json({
        success: false,
        message: "Recording audio file not found",
      });
    }

    const backendDir = path.resolve(__dirname, "../..");
    const pythonPath = path.join(
      backendDir,
      "whisper-venv",
      "Scripts",
      "python.exe"
    );
    const workerPath = path.join(
      backendDir,
      "python",
      "transcribe.py"
    );

    if (
      !fs.existsSync(pythonPath) ||
      !fs.existsSync(workerPath)
    ) {
      return res.status(500).json({
        success: false,
        message: "Transcription service is not configured",
      });
    }

    logger.info("Starting audio transcription", {
      recordingId: id,
      userId,
    });

    execFile(
      pythonPath,
      [workerPath, recording.file_path],
      {
        timeout: 600000,
        maxBuffer: 10 * 1024 * 1024,
        windowsHide: true,
      },
      async (error, stdout) => {
        if (error) {
          logger.error("Audio transcription failed", {
            error: error.message,
            recordingId: id,
            userId,
          });

          return res.status(error.killed ? 504 : 500).json({
            success: false,
            message: error.killed
              ? "Transcription timed out"
              : "Failed to transcribe recording",
          });
        }

        try {
          const transcript = JSON.parse(stdout);

          if (
            typeof transcript.text !== "string" ||
            !Array.isArray(transcript.segments)
          ) {
            throw new Error("Invalid transcription response");
          }

          // Save the transcript and its timestamped segments.
          await pool.query(
            `
            INSERT INTO recording_transcripts (
              recording_id,
              language,
              language_probability,
              transcript_text,
              segments
            )
            VALUES ($1, $2, $3, $4, $5::jsonb)
            ON CONFLICT (recording_id)
            DO UPDATE SET
              language = EXCLUDED.language,
              language_probability = EXCLUDED.language_probability,
              transcript_text = EXCLUDED.transcript_text,
              segments = EXCLUDED.segments,
              updated_at = NOW()
            `,
            [
              recording.id,
              transcript.language ?? null,
              transcript.languageProbability ?? null,
              transcript.text,
              JSON.stringify(transcript.segments),
            ]
          );

          logger.info("Audio transcription saved", {
            recordingId: id,
            userId,
          });

          return res.json({
            success: true,
            data: {
              recordingId: recording.id,
              recordingName: recording.name,
              language: transcript.language,
              languageProbability:
                transcript.languageProbability,
              text: transcript.text,
              segments: transcript.segments,
            },
          });
        } catch (saveError) {
          logger.error("Failed to process or save transcript", {
            error: saveError.message,
            recordingId: id,
            userId,
          });

          return res.status(500).json({
            success: false,
            message: "Failed to save transcription",
          });
        }
      }
    );
  } catch (error) {
    logger.error("Failed to start transcription", {
      error: error.message,
      recordingId: id,
      userId,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to transcribe recording",
    });
  }
}

async function getRecordingTranscript(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT
        r.id AS recording_id,
        r.name AS recording_name,
        t.language,
        t.language_probability,
        t.transcript_text,
        t.segments,
        t.created_at,
        t.updated_at
      FROM recordings r
      LEFT JOIN recording_transcripts t
        ON t.recording_id = r.id
      WHERE r.id = $1
        AND r.user_id = $2
        AND r.deleted_at IS NULL
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    const row = result.rows[0];

    if (row.transcript_text === null) {
      return res.status(404).json({
        success: false,
        message: "Transcript has not been generated yet",
      });
    }

    return res.json({
      success: true,
      data: {
        recordingId: row.recording_id,
        recordingName: row.recording_name,
        language: row.language,
        languageProbability: row.language_probability,
        text: row.transcript_text,
        segments: row.segments,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    logger.error("Failed to retrieve transcript", {
      error: error.message,
      recordingId: id,
      userId,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve transcript",
    });
  }
}


async function getRecordingFile(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        file_path,
        file_name,
        mime_type
      FROM recordings
      WHERE id = $1
        AND user_id = $2
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    const recording = result.rows[0];

    if (!recording.file_path) {
      return res.status(404).json({
        success: false,
        message: "Recording file not found",
      });
    }

    const filePath = path.resolve(
      recording.file_path
    );

    res.sendFile(filePath, (error) => {
      if (error) {
        logger.error(
          "Failed to send recording file",
          {
            error: error.message,
            recordingId: id,
            userId: req.user.id,
          }
        );

        if (!res.headersSent) {
          res.status(404).json({
            success: false,
            message: "Recording file not found",
          });
        }
      }
    });
  } catch (error) {
    logger.error(
      "Failed to fetch recording file",
      {
        error: error.message,
        recordingId: req.params.id,
        userId: req.user.id,
      }
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch recording file",
    });
  }
}

module.exports = {
  getRecordings,
  createRecording,
  getRecordingById,
  deleteRecording,
  getTrashedRecordings,
  restoreRecording,
  renameRecording,
  uploadRecording,
  getRecordingFile,
  convertRecording,
  trimRecording,
  transcribeRecording,
  getRecordingTranscript,
};