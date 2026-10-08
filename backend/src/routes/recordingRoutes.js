const express = require("express");

const {
  getRecordings,
  createRecording,
  getRecordingById,
  deleteRecording,
  renameRecording,
  uploadRecording,
  getRecordingFile,
} = require("../controllers/recordingController");

const upload = require("../middleware/upload");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getRecordings);
router.post("/", authenticateToken, createRecording);
router.post(
  "/upload",
  authenticateToken,
  upload.single("audio"),
  uploadRecording
);
router.get("/:id/file", authenticateToken, getRecordingFile);
router.get("/:id", authenticateToken, getRecordingById);

router.patch(
  "/:id",
  authenticateToken,
  renameRecording
);

router.delete("/:id", authenticateToken, deleteRecording);

module.exports = router;