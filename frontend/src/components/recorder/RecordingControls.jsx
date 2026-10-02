import { Mic, Square } from "lucide-react";

function RecordingControls({ isRecording, onStart, onStop }) {
  return (
    <div className="recording-controls">
      {!isRecording ? (
        <button className="record-button" onClick={onStart}>
          <Mic size={20} />
          Start Recording
        </button>
      ) : (
        <button className="stop-button" onClick={onStop}>
          <Square size={20} />
          Stop Recording
        </button>
      )}
    </div>
  );
}

export default RecordingControls;