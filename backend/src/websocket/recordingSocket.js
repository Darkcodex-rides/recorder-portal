const { WebSocketServer } = require("ws");
const logger = require("../utils/logger");

function setupWebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  wss.on("connection", (ws) => {
    //console.log("WebSocket client connected");
    logger.info("WebSocket client connected");

    ws.send(
      JSON.stringify({
        type: "connection",
        message: "WebSocket connected successfully",
      })
    );

    ws.on("message", (message) => {
  try {
    const data = JSON.parse(message);

    // console.log(
    //   "WebSocket message received:",
    //   data
    // );

    logger.info(
      "WebSocket message received",
      data
    );

    if (data.type === "recording:start") {
      ws.send(
        JSON.stringify({
          type: "recording:status",
          status: "Recording",
          message: "Recording started",
        })
      );

      return;
    }

    if (data.type === "recording:stop") {
      ws.send(
        JSON.stringify({
          type: "recording:status",
          status: "Saving",
          message: "Recording stopped",
        })
      );

      return;
    }

    ws.send(
      JSON.stringify({
        type: "ack",
        message: "Message received",
        data,
      })
    );
  } catch (error) {
    // console.error(
    //   "Invalid WebSocket message:",
    //   error.message
    // );

    logger.error(
  "Invalid WebSocket message",
  {
    error: error.message,
  }
);

  }
});

    ws.on("close", () => {
      //console.log("WebSocket client disconnected");
      logger.info("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
     // console.error("WebSocket error:", error);
     logger.error(
  "WebSocket error",
  {
    error: error.message,
  }
);
    });
  });

  console.log("WebSocket server initialized on /ws");

  return wss;
}

module.exports = setupWebSocket;