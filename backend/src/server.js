const express = require("express");
const cors = require("cors");
const http = require("http");
const multer = require("multer");

require("dotenv").config();

const pool = require("./config/database");
const recordingRoutes = require("./routes/recordingRoutes");
const authRoutes = require("./routes/authRoutes");
const setupWebSocket = require("./websocket/recordingSocket");
const logger = require("./utils/logger");

const app = express();

const PORT = process.env.PORT || 5000;

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Parse JSON request bodies
app.use(express.json());

// API routes
app.use("/api/recordings", recordingRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW()"
    );

    res.json({
      status: "ok",
      message: "Design Recorder Backend is running",
      database: "connected",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    logger.error(
      "Database health check failed",
      {
        error: error.message,
      }
    );

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

// Handle unknown API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Centralized error handler
app.use((error, req, res, next) => {
  // Multer errors
  if (error instanceof multer.MulterError) {
    logger.error("File upload error", {
      error: error.message,
      code: error.code,
      method: req.method,
      path: req.path,
    });

    return res.status(400).json({
      success: false,
      message: "File upload failed",
      error: error.message,
    });
  }

  // Invalid file type from upload fileFilter
  if (
    error.message ===
    "Invalid file type. Only audio files are allowed."
  ) {
    logger.error("Invalid file type", {
      error: error.message,
      method: req.method,
      path: req.path,
    });

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Unexpected server errors
  logger.error("Unhandled server error", {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
  });

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const server = http.createServer(app);

setupWebSocket(server);

server.listen(PORT, () => {
  logger.info(
    `Server running on http://localhost:${PORT}`
  );
});