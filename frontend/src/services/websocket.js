const WS_URL = "ws://localhost:5000/ws";

export function createWebSocket(onMessage) {
  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      console.log("WebSocket message:", data);

      if (onMessage) {
        onMessage(data);
      }
    } catch (error) {
      console.error(
        "Failed to parse WebSocket message:",
        error
      );
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };

  return socket;
}