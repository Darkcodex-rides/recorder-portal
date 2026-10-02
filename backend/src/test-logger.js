const logger = require("./utils/logger");

logger.info("Design Recorder backend started");

logger.info("Test recording event", {
  recordingId: 1,
  status: "Recording",
});

logger.error("Test error message");