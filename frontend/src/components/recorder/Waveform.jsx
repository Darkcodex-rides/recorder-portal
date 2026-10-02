import { useEffect, useState } from "react";

function Waveform({ isRecording }) {
  const [bars, setBars] = useState(
    Array.from({ length: 40 }, () => 20)
  );

  useEffect(() => {
    if (!isRecording) {
      setBars(Array.from({ length: 40 }, () => 20));
      return;
    }

    const interval = setInterval(() => {
      setBars(
        Array.from(
          { length: 40 },
          () => Math.floor(Math.random() * 45) + 10
        )
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className={`waveform ${isRecording ? "active" : ""}`}>
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