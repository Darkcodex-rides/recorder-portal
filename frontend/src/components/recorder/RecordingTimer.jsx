import { useEffect } from "react";

function RecordingTimer({ isRecording, duration, setDuration,durationRef }) {
  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const interval = setInterval(() => {
      //setDuration((previousDuration) => previousDuration + 1);
      setDuration((previousDuration) => {
  const newDuration = previousDuration + 1;

  durationRef.current = newDuration;

  return newDuration;
});
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, setDuration]);

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return (
    <div className="recording-timer">
      {hours > 0
        ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
        : `${formattedMinutes}:${formattedSeconds}`}
    </div>
  );
}

export default RecordingTimer;