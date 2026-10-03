import { useEffect, useState } from "react";

function AudioPlayer({ recording }) {
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    let objectUrl = null;

    const loadAudio = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/recordings/${recording.id}/file`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load audio");
        }

        const blob = await response.blob();

        objectUrl = URL.createObjectURL(blob);
        setAudioUrl(objectUrl);
      } catch (error) {
        console.error("Failed to load audio:", error);
      }
    };

    loadAudio();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [recording.id]);

  if (!audioUrl) {
    return <p>Loading audio...</p>;
  }

  return (
    <div className="audio-player">
      <audio controls src={audioUrl}>
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}

export default AudioPlayer;