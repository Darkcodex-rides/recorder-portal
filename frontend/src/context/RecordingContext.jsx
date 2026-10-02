import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  saveRecording,
  getRecordings,
  deleteRecordingFromStorage,
} from "../utils/recordingStorage";

// import { getRecordings as getBackendRecordings } from "../services/api";
//import { getRecordings, deleteRecording } from "../services/api";
import {
  getRecordings as getBackendRecordings,
  deleteRecording,
} from "../services/api";

const RecordingContext = createContext(null);

export function RecordingProvider({ children }) {
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const loadRecordings = async () => {
    try {
      const response = await getBackendRecordings();

      setRecordings(response.data);
    } catch (error) {
      console.error(
        "Failed to load recordings:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  loadRecordings();
}, []);

  const addRecording = async (recording) => {
    try {
      await saveRecording(recording);

      setRecordings((previousRecordings) => [
        recording,
        ...previousRecordings,
      ]);
    } catch (error) {
      console.error(
        "Failed to save recording:",
        error
      );
    }
  };

  const handleDeleteRecording = async (id) => {
  try {
    await deleteRecording(id);

    setRecordings((previousRecordings) =>
      previousRecordings.filter(
        (recording) => recording.id !== id
      )
    );

    console.log("Recording deleted successfully:", id);
  } catch (error) {
    console.error("Failed to delete recording:", error);
    alert("Failed to delete recording.");
  }
};

  return (
    <RecordingContext.Provider
      value={{
        recordings,
        addRecording,
        deleteRecording :handleDeleteRecording,
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