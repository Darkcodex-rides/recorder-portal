import { useEffect, useRef } from "react";
import { createWebSocket } from "../services/websocket";

function useWebSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = createWebSocket((data) => {
      console.log("WebSocket received:", data);
    });

    socketRef.current = socket;

    return () => {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };
  }, []);

  const sendMessage = (message) => {
    const socket = socketRef.current;

    if (!socket) {
      console.warn("WebSocket is not initialized");
      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      console.warn(
        "WebSocket is not connected yet. ReadyState:",
        socket.readyState
      );
      return;
    }

    console.log("Sending WebSocket message:", message);

    socket.send(JSON.stringify(message));
  };

  return {
    sendMessage,
  };
}

export default useWebSocket;