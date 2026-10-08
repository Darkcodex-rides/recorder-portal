import {
  Check,
  Clock3,
  Download,
  Edit3,
  FileAudio,
  Trash2,
  X,
} from "lucide-react";

import { useState } from "react";

import AudioPlayer from "./AudioPlayer";
import { useRecordingContext } from "../../context/RecordingContext";


function RecordingCard({ recording }) {
  const {
  deleteRecording,
  renameRecording,
} = useRecordingContext();

const [isRenaming, setIsRenaming] = useState(false);
const [renameValue, setRenameValue] = useState(
  recording.name
);
const [isSavingName, setIsSavingName] = useState(false);

const startRename = () => {
  setRenameValue(recording.name);
  setIsRenaming(true);
};

const cancelRename = () => {
  setRenameValue(recording.name);
  setIsRenaming(false);
};

const saveRename = async () => {
  const normalizedName = renameValue.trim();

  if (!normalizedName) {
    return;
  }

  if (normalizedName === recording.name) {
    setIsRenaming(false);
    return;
  }

  try {
    setIsSavingName(true);

    await renameRecording(
      recording.id,
      normalizedName
    );

    setIsRenaming(false);
  } catch (error) {
    console.error(
      "Failed to rename recording:",
      error
    );

    alert("Failed to rename recording.");
  } finally {
    setIsSavingName(false);
  }
};

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
  {isRenaming ? (
    <div className="recording-rename-input-wrapper">
      <input
        type="text"
        value={renameValue}
        onChange={(event) =>
          setRenameValue(event.target.value)
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            saveRename();
          }

          if (event.key === "Escape") {
            cancelRename();
          }
        }}
        maxLength={255}
        autoFocus
        aria-label="Recording name"
      />

      <button
        type="button"
        onClick={saveRename}
        disabled={
          isSavingName ||
          !renameValue.trim()
        }
        title="Save name"
      >
        <Check size={14} />
      </button>

      <button
        type="button"
        onClick={cancelRename}
        disabled={isSavingName}
        title="Cancel rename"
      >
        <X size={14} />
      </button>
    </div>
  ) : (
    <h3>{recording.name}</h3>
  )}

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
  onClick={startRename}
  title="Rename recording"
  type="button"
  disabled={isRenaming}
>
  <Edit3 size={17} />
</button>

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