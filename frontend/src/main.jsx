import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App.jsx";
import { RecordingProvider } from "./context/RecordingContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RecordingProvider>
      <App />
    </RecordingProvider>
  </StrictMode>
);