import { AlertCircle, LoaderCircle, Play } from "lucide-react";
import { useEffect, useState } from "react";

function AudioPlayer({ recording }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = null;

    const loadAudio = async () => {
      try {
        setError(false);

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
        setError(true);
      }
    };

    loadAudio();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [recording.id]);

  if (error) {
    return (
      <div className="audio-player-error">
        <AlertCircle size={15} />
        <span>Unable to load audio</span>
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div className="audio-player-loading">
        <LoaderCircle size={15} className="audio-loading-icon" />
        <span>Loading audio stream...</span>
      </div>
    );
  }

  return (
    <div className="audio-player">
      <div className="audio-player-label">
        <div>
          <Play size={12} />
          <span>AUDIO PLAYER</span>
        </div>

        <span>READY</span>
      </div>

      <audio controls src={audioUrl}>
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}

export default AudioPlayer;