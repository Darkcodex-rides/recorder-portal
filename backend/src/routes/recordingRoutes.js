const express = require("express");

const {
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
} = require("../controllers/recordingController");
const { summarizeRecording, getRecordingSummary } = require("../controllers/summaryController");

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

router.get(
  "/trash",
  authenticateToken,
  getTrashedRecordings
); 

router.post(
  "/:id/convert",
  authenticateToken,
  convertRecording
);
router.post(
  "/:id/trim",
  authenticateToken,
  trimRecording
);

router.post(
  "/:id/transcribe",
  authenticateToken,
  transcribeRecording
);


router.get(
  "/:id/transcript",
  authenticateToken,
  getRecordingTranscript
);

router.get("/:id/summary", authenticateToken, getRecordingSummary);
router.post("/:id/summarize", authenticateToken, summarizeRecording);
router.get("/:id/file", authenticateToken, getRecordingFile);
router.get("/:id", authenticateToken, getRecordingById);

router.patch(
  "/:id",
  authenticateToken,
  renameRecording
);


router.patch(
  "/:id/restore",
  authenticateToken,
  restoreRecording
);



router.delete("/:id", authenticateToken, deleteRecording);




module.exports = router;
