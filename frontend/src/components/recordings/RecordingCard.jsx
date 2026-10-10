import {
  Check,
  Clock3,
  Download,
  Edit3,
  FileAudio,
  RefreshCw,
  Scissors,
  Trash2,
  X,
} from "lucide-react";

import { useState } from "react";

import AudioPlayer from "./AudioPlayer";
import { useRecordingContext } from "../../context/RecordingContext";


function formatDuration(seconds) {
  const totalSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = Math.floor(totalSeconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size <= 0) {
    return "Size unavailable";
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}


function getAudioFormat(recording) {
  const mimeType = (
    recording.mime_type ||
    recording.mimeType ||
    ""
  ).toLowerCase();

  if (mimeType.includes("/")) {
    const subtype = mimeType.split("/")[1].split(";")[0];

    if (subtype === "mpeg") return "MP3";
    if (subtype === "x-wav" || subtype === "wav") return "WAV";
    if (subtype === "mp4") return "MP4";

    return subtype.toUpperCase();
  }

  const fileName = (
    recording.file_name ||
    recording.fileName ||
    ""
  ).toLowerCase();

  const extension = fileName.split(".").pop();

  return extension && extension !== fileName
    ? extension.toUpperCase()
    : "AUDIO";
}


function formatCreatedDate(dateValue) {
  if (!dateValue) {
    return "Date unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function RecordingCard({ recording }) {
  const {
  deleteRecording,
  renameRecording,
  convertRecording,
  trimRecording,
} = useRecordingContext();

const [isRenaming, setIsRenaming] = useState(false);
const [renameValue, setRenameValue] = useState(
  recording.name
);
const [isSavingName, setIsSavingName] = useState(false);
const [convertingFormat, setConvertingFormat] = useState("");
const [conversionError, setConversionError] = useState("");

const [showTrimControls, setShowTrimControls] = useState(false);
const [trimStart, setTrimStart] = useState("0");
const [trimEnd, setTrimEnd] = useState("");
const [isTrimming, setIsTrimming] = useState(false);
const [trimError, setTrimError] = useState("");

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

const handleConvert = async (format) => {
  try {
    setConvertingFormat(format);
    setConversionError("");

    await convertRecording(recording.id, format);
  } catch (error) {
    console.error("Audio conversion failed:", error);
    setConversionError(
      error.message || "Failed to convert audio."
    );
  } finally {
    setConvertingFormat("");
  }
};

const handleTrim = async () => {
  const start = Number(trimStart);
  const end = Number(trimEnd);
  const duration = Number(recording.duration);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    end <= start
  ) {
    setTrimError("Enter a valid start and end time.");
    return;
  }

  if (end > duration) {
    setTrimError(
      `End time cannot exceed ${duration} seconds.`
    );
    return;
  }

  try {
    setIsTrimming(true);
    setTrimError("");

    await trimRecording(recording.id, start, end);

    setShowTrimControls(false);
    setTrimStart("0");
    setTrimEnd("");
  } catch (error) {
    console.error("Audio trimming failed:", error);
    setTrimError(error.message || "Failed to trim audio.");
  } finally {
    setIsTrimming(false);
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
        {conversionError && (
  <p className="recording-conversion-error" role="alert">
    {conversionError}
  </p>
)}
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
  {getAudioFormat(recording)}
</span>
</div>

          <div className="recording-card-meta">
  <span title="Recording duration">
    <Clock3 size={13} />
    {formatDuration(recording.duration)}
  </span>

  <span title="Audio file size">
    <FileAudio size={13} />
    {formatFileSize(recording.file_size ?? recording.fileSize)}
  </span>

  <span title="Date created">
    {formatCreatedDate(
      recording.created_at ?? recording.createdAt
    )}
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
  onClick={() => handleConvert("wav")}
  title="Convert to WAV"
  type="button"
  disabled={Boolean(convertingFormat)}
>
  {convertingFormat === "wav" ? (
    <RefreshCw size={17} />
  ) : (
    <span>WAV</span>
  )}
</button>

<button
  className="recording-action-button"
  onClick={() => handleConvert("mp3")}
  title="Convert to MP3"
  type="button"
  disabled={Boolean(convertingFormat)}
>
  {convertingFormat === "mp3" ? (
    <RefreshCw size={17} />
  ) : (
    <span>MP3</span>
  )}
</button>

<button
  className="recording-action-button"
  onClick={() => {
    setShowTrimControls((previous) => !previous);
    setTrimError("");
  }}
  title="Trim recording"
  type="button"
  disabled={isTrimming}
>
  <Scissors size={17} />
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

      
{showTrimControls && (
  <div className="recording-trim-controls">
    <h4>Trim Audio</h4>
    <p>Enter the start and end times in seconds.</p>

    <div className="recording-trim-fields">
      <label>
        Start (seconds)
        <input
          type="number"
          min="0"
          step="0.1"
          value={trimStart}
          onChange={(event) => setTrimStart(event.target.value)}
          disabled={isTrimming}
        />
      </label>

      <label>
        End (seconds)
        <input
          type="number"
          min="0"
          step="0.1"
          max={recording.duration}
          value={trimEnd}
          onChange={(event) => setTrimEnd(event.target.value)}
          disabled={isTrimming}
          placeholder={`Max ${recording.duration}`}
        />
      </label>
    </div>

    {trimError && (
      <p className="recording-trim-error" role="alert">
        {trimError}
      </p>
    )}

    <div className="recording-trim-actions">
      <button
        type="button"
        onClick={handleTrim}
        disabled={isTrimming}
      >
        {isTrimming ? "Trimming..." : "Create Trimmed Copy"}
      </button>

      <button
        type="button"
        onClick={() => {
          setShowTrimControls(false);
          setTrimError("");
        }}
        disabled={isTrimming}
      >
        Cancel
      </button>
    </div>
  </div>
)}

<div className="recording-card-player">
  <AudioPlayer recording={recording} />
</div>

    </article>
  );
}

export default RecordingCard;