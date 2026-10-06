import {
  Clock3,
  Download,
  FileAudio,
  Trash2,
} from "lucide-react";

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
    <article className="recording-card">
      <div className="recording-card-main">
        <div className="recording-file-icon">
          <FileAudio size={21} />
        </div>

        <div className="recording-card-info">
          <div className="recording-card-title-row">
            <h3>{recording.name}</h3>

            <span className="recording-format-badge">
              WEBM
            </span>
          </div>

          <div className="recording-card-meta">
            <span>
              <Clock3 size={13} />
              {recording.duration}s
            </span>

            <span>
              <span className="meta-status-dot" />
              SAVED
            </span>
          </div>
        </div>

        <div className="recording-card-actions">
          <button
            className="recording-action-button"
            onClick={downloadRecording}
            title="Download recording"
            type="button"
          >
            <Download size={17} />
          </button>

          <button
            className="recording-action-button recording-delete-button"
            onClick={() => deleteRecording(recording.id)}
            title="Delete recording"
            type="button"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <div className="recording-card-player">
        <AudioPlayer recording={recording} />
      </div>
    </article>
  );
}

export default RecordingCard;