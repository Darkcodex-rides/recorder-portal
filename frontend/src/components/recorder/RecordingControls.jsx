import { Mic, Square } from "lucide-react";

function RecordingControls({
  isRecording,
  onStart,
  onStop,
}) {
  return (
    <div className="recording-controls">
      {!isRecording ? (
        <button
          className="record-button"
          onClick={onStart}
          type="button"
        >
          <span className="record-button-icon">
            <Mic size={20} />
          </span>

          <span>
            <strong>Start Recording</strong>
            <small>Begin audio capture</small>
          </span>

          <span className="button-arrow">
            →
          </span>
        </button>
      ) : (
        <button
          className="stop-button"
          onClick={onStop}
          type="button"
        >
          <span className="stop-button-icon">
            <Square size={17} />
          </span>

          <span>
            <strong>Stop Recording</strong>
            <small>Save current session</small>
          </span>

          <span className="button-arrow">
            →
          </span>
        </button>
      )}
    </div>
  );
}

export default RecordingControls;