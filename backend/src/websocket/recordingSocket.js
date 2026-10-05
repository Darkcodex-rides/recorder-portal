const { WebSocketServer } = require("ws");

const logger = require("../utils/logger");

function setupWebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  wss.on("connection", (ws) => {
    logger.info("WebSocket client connected");

    ws.send(
      JSON.stringify({
        type: "connection",
        message: "WebSocket connected successfully",
      })
    );

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(
          message.toString()
        );

        if (
          !data ||
          typeof data !== "object" ||
          Array.isArray(data)
        ) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid message format",
            })
          );

          return;
        }

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
        logger.error(
          "Invalid WebSocket message",
          {
            error: error.message,
          }
        );

        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid JSON message",
          })
        );
      }
    });

    ws.on("close", () => {
      logger.info(
        "WebSocket client disconnected"
      );
    });

    ws.on("error", (error) => {
      logger.error(
        "WebSocket error",
        {
          error: error.message,
        }
      );
    });
  });

  logger.info(
    "WebSocket server initialized on /ws"
  );

  return wss;
}

module.exports = setupWebSocket;