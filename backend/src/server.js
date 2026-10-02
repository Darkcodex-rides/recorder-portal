const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const pool = require("./config/database");
const recordingRoutes = require("./routes/recordingRoutes");
const setupWebSocket = require("./websocket/recordingSocket");
const logger = require("./utils/logger");


const app = express();

const PORT = process.env.PORT || 5000;

// CORS must come before routes
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// Recording routes
app.use("/api/recordings", recordingRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      message: "Design Recorder Backend is running",
      database: "connected",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

const server = http.createServer(app);

setupWebSocket(server);

server.listen(PORT, () => {
  //console.log(`Server running on http://localhost:${PORT}`);
  logger.info(
  `Server running on http://localhost:${PORT}`
);
});