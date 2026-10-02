import { Download, Trash2 } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import { useRecordingContext } from "../../context/RecordingContext";

function RecordingCard({ recording }) {
  const { deleteRecording } = useRecordingContext();

  const downloadRecording = () => {
    const link = document.createElement("a");

    link.href = recording.url;
    link.download = `${recording.name}.webm`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="recording-card">
      <div className="recording-card-header">
        <div>
          <h3>{recording.name}</h3>

          <p>
            Duration: {recording.duration}s
          </p>
        </div>

        <div className="recording-actions">
          <button
            className="action-button"
            onClick={downloadRecording}
            title="Download"
          >
            <Download size={18} />
          </button>

          <button
            className="action-button delete-button"
            onClick={() => deleteRecording(recording.id)}
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <AudioPlayer recording={recording} />
    </div>
  );
}

export default RecordingCard;