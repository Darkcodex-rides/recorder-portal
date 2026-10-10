
import { useEffect, useState } from "react";

const BAR_COUNT = 40;

function createIdleBars() {
  return Array.from({ length: BAR_COUNT }, () => 4);
}

function Waveform({ isRecording, audioStream }) {
  const [bars, setBars] = useState(createIdleBars);

  useEffect(() => {
    if (!isRecording || !audioStream) {
      setBars(createIdleBars());
      return;
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      console.warn("Web Audio API is not supported.");
      return;
    }

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;

    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);

    const samples = new Uint8Array(analyser.fftSize);
    let animationFrameId;

    const drawWaveform = () => {
      analyser.getByteTimeDomainData(samples);

      const samplesPerBar = Math.floor(
        samples.length / BAR_COUNT
      );

      const nextBars = Array.from(
        { length: BAR_COUNT },
        (_, index) => {
          const start = index * samplesPerBar;
          let total = 0;

          for (
            let i = start;
            i < start + samplesPerBar;
            i += 1
          ) {
            const amplitude = (samples[i] - 128) / 128;
            total += amplitude * amplitude;
          }

          const rms = Math.sqrt(total / samplesPerBar);

          return Math.max(
            4,
            Math.min(48, 4 + rms * 180)
          );
        }
      );

      setBars(nextBars);
      animationFrameId = requestAnimationFrame(drawWaveform);
    };

    const startAnalyser = async () => {
      try {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        drawWaveform();
      } catch (error) {
        console.error("Could not start audio visualization:", error);
      }
    };

    startAnalyser();

    return () => {
      cancelAnimationFrame(animationFrameId);
      source.disconnect();
      analyser.disconnect();

      if (audioContext.state !== "closed") {
        audioContext.close().catch(console.error);
      }
    };
  }, [isRecording, audioStream]);

  return (
    <div
      className={`waveform ${isRecording ? "active" : ""}`}
      role="img"
      aria-label={
        isRecording
          ? "Live microphone audio waveform"
          : "Audio waveform idle"
      }
    >
      {bars.map((height, index) => (
        <span
          key={index}
          className="waveform-bar"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

export default Waveform;
