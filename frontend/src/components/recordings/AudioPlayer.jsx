
import {
  AlertCircle,
  LoaderCircle,
  Pause,
  Play,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function AudioPlayer({ recording }) {
  //console.log("AudioPlayer rendered:", recording.id);
  const waveformRef = useRef(null);
  const waveSurferRef = useRef(null);

  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Load the recording using the existing authenticated API.
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = null;
    let cancelled = false;

    setAudioUrl(null);
    setError(false);
    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const loadAudio = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/recordings/${recording.id}/file`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load audio");
        }

        const blob = await response.blob();

        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setAudioUrl(objectUrl);
      } catch (loadError) {
        if (loadError.name === "AbortError") {
          return;
        }

        console.error("Failed to load audio:", loadError);

        if (!cancelled) {
          setError(true);
        }
      }
    };

    loadAudio();

    return () => {
      cancelled = true;
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [recording.id]);

  // Create and clean up the interactive waveform.
  useEffect(() => {
    if (!audioUrl || !waveformRef.current) {
      return undefined;
    }

    const waveSurfer = WaveSurfer.create({
      container: waveformRef.current,
      height: 56,
      waveColor: "#354158",
      progressColor: "#818cf8",
      cursorColor: "#c7d2fe",
      cursorWidth: 2,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      normalize: true,
      interact: true,
      dragToSeek: true,
      hideScrollbar: true,
    });

    waveSurferRef.current = waveSurfer;
    console.log("WaveSurfer instance created:", recording.id);

    const unsubscribeReady = waveSurfer.on("ready", (loadedDuration) => {
      console.log("WaveSurfer ready:", recording.id, loadedDuration);
      setDuration(loadedDuration);
      setCurrentTime(0);
      setIsReady(true);
      setError(false);
    });

    const unsubscribeTime = waveSurfer.on("timeupdate", (time) => {
      setCurrentTime(time);
    });

    const unsubscribePlay = waveSurfer.on("play", () => {
      setIsPlaying(true);
    });

    const unsubscribePause = waveSurfer.on("pause", () => {
      setIsPlaying(false);
    });

    const unsubscribeFinish = waveSurfer.on("finish", () => {
      setIsPlaying(false);
    });

    const unsubscribeError = waveSurfer.on("error", (loadError) => {
  console.error("Waveform playback error:", loadError);
  console.error("WaveSurfer playback error:", loadError);
  setError(true);
});

console.log("WaveSurfer loading audio:", {
  recordingId: recording.id,
  audioUrl,
});

    waveSurfer.load(audioUrl).catch((loadError) => {
  console.error("WaveSurfer failed to load audio:", loadError);
  setError(true);
});

    return () => {
      unsubscribeReady();
      unsubscribeTime();
      unsubscribePlay();
      unsubscribePause();
      unsubscribeFinish();
      unsubscribeError();

      waveSurfer.destroy();

      if (waveSurferRef.current === waveSurfer) {
        waveSurferRef.current = null;
      }
    };
  }, [audioUrl]);

  const handlePlayPause = async () => {
    if (!waveSurferRef.current || !isReady) {
      return;
    }

    try {
      await waveSurferRef.current.playPause();
    } catch (playError) {
      console.error("Unable to play recording:", playError);
    }
  };

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
    <div className="audio-player interactive-audio-player">
      <div className="audio-player-label">
        <div>
          <Play size={12} />
          <span>AUDIO PLAYER</span>
        </div>

        <span>{isReady ? "READY" : "PREPARING"}</span>
      </div>

      <div className="interactive-player-controls">
        <button
          type="button"
          className="waveform-play-button"
          onClick={handlePlayPause}
          disabled={!isReady}
          aria-label={isPlaying ? "Pause recording" : "Play recording"}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} />}
        </button>

        <div className="waveform-timeline">
          <div
            ref={waveformRef}
            className="audio-waveform"
            role="group"
            aria-label="Audio waveform. Click or drag to seek."
          />

          <div className="waveform-time-labels">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
