const pool = require("../config/database");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

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
};