const express = require("express");

const {
  getRecordings,
  createRecording,
  getRecordingById,
  deleteRecording,
  uploadRecording,
  getRecordingFile,
} = require("../controllers/recordingController");

const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getRecordings);

router.post("/", createRecording);

router.post(
  "/upload",
  upload.single("audio"),
  uploadRecording
);

router.get("/:id/file", getRecordingFile);

router.get("/:id", getRecordingById);

router.delete("/:id", deleteRecording);

module.exports = router;