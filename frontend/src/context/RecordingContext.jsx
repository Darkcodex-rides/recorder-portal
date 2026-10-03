import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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
      const token = localStorage.getItem("token");

      // Don't call protected API if user is not logged in
      if (!token) {
        setRecordings([]);
        setIsLoading(false);
        return;
      }

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
  }, []);

  const addRecording = async (recording) => {
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

  return (
    <RecordingContext.Provider
      value={{
        recordings,
        addRecording,
        deleteRecording: handleDeleteRecording,
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