const pool = require("../config/database");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

async function getRecordings(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        duration,
        file_name,
        file_path,
        mime_type,
        file_size,
        created_at
      FROM recordings
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch recordings:", error);

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

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Recording name is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO recordings (
        name,
        duration,
        file_name,
        file_path,
        mime_type,
        file_size
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        name,
        duration || 0,
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
    console.error("Failed to create recording:", error);

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
        file_path,
        mime_type,
        file_size,
        created_at
      FROM recordings
      WHERE id = $1
      `,
      [id]
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
    console.error("Failed to fetch recording:", error);

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
      DELETE FROM recordings
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    const deletedRecording = result.rows[0];

    logger.info("Recording deleted", {
  recordingId: deletedRecording.id,
  name: deletedRecording.name,
});

    if (deletedRecording.file_path) {
      const filePath = path.resolve(
        deletedRecording.file_path
      );

      try {
        await fs.promises.unlink(filePath);

        console.log(
          "Recording file deleted:",
          filePath
        );
      } catch (fileError) {
        console.error(
          "Failed to delete recording file:",
          fileError.message
        );
      }
    }

    res.json({
      success: true,
      message: "Recording and audio file deleted successfully",
      data: deletedRecording,
    });
  } catch (error) {
    console.error(
      "Failed to delete recording:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete recording",
    });
  }
}

async function uploadRecording(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required",
      });
    }

    const {
      name,
      duration,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO recordings (
        name,
        duration,
        file_name,
        file_path,
        mime_type,
        file_size
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        name || req.file.originalname,
        duration || 0,
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.file.size,
      ]
    );

    logger.info("Recording uploaded", {
  recordingId: result.rows[0].id,
  name: result.rows[0].name,
  fileSize: result.rows[0].file_size,
});

    res.status(201).json({
      success: true,
      message: "Recording uploaded successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to upload recording:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload recording",
    });
  }
}

//const path = require("path");

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
      `,
      [id]
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

    const filePath = path.resolve(recording.file_path);

    res.sendFile(filePath, (error) => {
      if (error) {
        console.error("Failed to send recording file:", error);

        if (!res.headersSent) {
          res.status(404).json({
            success: false,
            message: "Recording file not found",
          });
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch recording file:", error);

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
  uploadRecording,
  getRecordingFile,

};