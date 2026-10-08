
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getRecordings as getBackendRecordings,
  deleteRecording,
  renameRecording,
} from "../services/api";

import { useAuth } from "./AuthContext";

const RecordingContext = createContext(null);

export function RecordingProvider({ children }) {
  const { token, isInitializing } = useAuth();

  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait until AuthContext finishes restoring authentication
    if (isInitializing) {
      return;
    }

    // User is logged out
    if (!token) {
      setRecordings([]);
      setIsLoading(false);
      return;
    }

    const loadRecordings = async () => {
      setIsLoading(true);

      try {
        console.log("Loading recordings from backend...");

        const response = await getBackendRecordings();

        console.log("Recordings loaded:", response);

        setRecordings(response.data || []);
      } catch (error) {
        console.error(
          "Failed to load recordings:",
          error
        );

        setRecordings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecordings();
  }, [token, isInitializing]);

  const addRecording = (recording) => {
    setRecordings((previousRecordings) => [
      recording,
      ...previousRecordings,
    ]);
  };

  const handleDeleteRecording = async (id) => {
    try {
      await deleteRecording(id);

      setRecordings((previousRecordings) =>
        previousRecordings.filter(
          (recording) => recording.id !== id
        )
      );

      console.log(
        "Recording deleted successfully:",
        id
      );
    } catch (error) {
      console.error(
        "Failed to delete recording:",
        error
      );

      alert("Failed to delete recording.");
    }
  };

  const handleRenameRecording = async (id, name) => {
  try {
    const response = await renameRecording(id, name);

    setRecordings((previousRecordings) =>
      previousRecordings.map((recording) =>
        recording.id === id
          ? {
              ...recording,
              name: response.data.name,
            }
          : recording
      )
    );

    console.log(
      "Recording renamed successfully:",
      id
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to rename recording:",
      error
    );

    throw error;
  }
};

  return (
    <RecordingContext.Provider
      value={{
  recordings,
  addRecording,
  deleteRecording: handleDeleteRecording,
  renameRecording: handleRenameRecording,
  isLoading,
}}
    >
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecordingContext() {
  const context = useContext(RecordingContext);

  if (!context) {
    throw new Error(
      "useRecordingContext must be used inside RecordingProvider"
    );
  }

  return context;
}
