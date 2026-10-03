import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App.jsx";
import { RecordingProvider } from "./context/RecordingContext";
import AuthProvider from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RecordingProvider>
        <App />
      </RecordingProvider>
    </AuthProvider>
  </StrictMode>
);