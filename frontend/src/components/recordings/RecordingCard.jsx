import {
  Activity,
  Check,
  Clock3,
  Download,
  Edit3,
  FileAudio,
  FileText,
  Languages,
  ListChecks,
  RefreshCw,
  Scissors,
  Trash2,
  X,
} from "lucide-react";

import { useState } from "react";

import AudioPlayer from "./AudioPlayer";
import { useRecordingContext } from "../../context/RecordingContext";
import {
  getRecordingTranscript,
  transcribeRecording,
  getRecordingSummary,
  summarizeRecording,
  getMeetingInsights,
  generateMeetingInsights,
} from "../../services/api";

import {
  analyzeRecordingAudio,
  getRecordingAudioAnalysis,
} from "../../services/api";


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

const [transcript, setTranscript] = useState(null);
const [isTranscribing, setIsTranscribing] = useState(false);
const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
const [transcriptError, setTranscriptError] = useState("");
const [showTranscript, setShowTranscript] = useState(false);

const [summary, setSummary] = useState(null);
const [isSummarizing, setIsSummarizing] = useState(false);
const [isLoadingSummary, setIsLoadingSummary] = useState(false);
const [summaryError, setSummaryError] = useState("");

const [meetingInsights, setMeetingInsights] = useState(null);
const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
const [isLoadingInsights, setIsLoadingInsights] = useState(false);
const [meetingInsightsError, setMeetingInsightsError] = useState("");

const [audioAnalysis, setAudioAnalysis] = useState(null);
const [audioAnalysisLoading, setAudioAnalysisLoading] = useState(false);
const [audioAnalysisError, setAudioAnalysisError] = useState("");

const handleLoadMeetingInsights = async () => {
  try {
    setIsLoadingInsights(true);
    setMeetingInsightsError("");

    const result = await getMeetingInsights(recording.id);
    setMeetingInsights(result.data ?? result);
  } catch (error) {
    console.error("Failed to load meeting insights:", error);
    setMeetingInsightsError(
      error.message || "Failed to load saved meeting insights."
    );
  } finally {
    setIsLoadingInsights(false);
  }
};

const handleGenerateMeetingInsights = async () => {
  try {
    setIsGeneratingInsights(true);
    setMeetingInsightsError("");

    const result = await generateMeetingInsights(recording.id);
    setMeetingInsights(result.data ?? result);
  } catch (error) {
    console.error("Meeting insights generation failed:", error);
    setMeetingInsightsError(
      error.message || "Failed to generate meeting insights."
    );
  } finally {
    setIsGeneratingInsights(false);
  }
};


const handleAnalyzeAudio = async () => {
  setAudioAnalysisLoading(true);
  setAudioAnalysisError("");

  try {
    const result = await analyzeRecordingAudio(recording.id);
    const saved = result.data ?? result.analysis;

    if (!saved) {
      throw new Error("The server returned no audio analysis.");
    }

    setAudioAnalysis(saved);
  } catch (error) {
    setAudioAnalysisError(
      error.message || "Failed to analyze recording audio."
    );
  } finally {
    setAudioAnalysisLoading(false);
  }
};

const handleLoadAudioAnalysis = async () => {
  setAudioAnalysisLoading(true);
  setAudioAnalysisError("");

  try {
    const result = await getRecordingAudioAnalysis(recording.id);
    const saved = result.data ?? result.analysis;

    if (!saved) {
      throw new Error("No saved audio analysis was returned.");
    }

    setAudioAnalysis(saved);
  } catch (error) {
    setAudioAnalysisError(
      error.message || "Failed to load saved audio analysis."
    );
  } finally {
    setAudioAnalysisLoading(false);
  }
};


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

  const handleLoadTranscript = async () => {
  try {
    setIsLoadingTranscript(true);
    setTranscriptError("");

    const result = await getRecordingTranscript(recording.id);
    const savedTranscript = result.data ?? result;

    setTranscript(savedTranscript);
    setShowTranscript(true);
  } catch (error) {
    console.error("Failed to load transcript:", error);
    setTranscriptError(
      error.message || "Failed to load saved transcript."
    );
  } finally {
    setIsLoadingTranscript(false);
  }
};

const handleTranscribe = async () => {
  try {
    setIsTranscribing(true);
    setTranscriptError("");
    setShowTranscript(true);

    const result = await transcribeRecording(recording.id);
    const generatedTranscript = result.data ?? result;

    setTranscript(generatedTranscript);
  } catch (error) {
    console.error("Transcription failed:", error);
    setTranscriptError(
      error.message || "Failed to transcribe recording."
    );
  } finally {
    setIsTranscribing(false);
  }
};


const handleLoadSummary = async () => {
  try {
    setIsLoadingSummary(true);
    setSummaryError("");

    const result = await getRecordingSummary(recording.id);
    const savedSummary = result.data ?? result;

    setSummary(savedSummary);
  } catch (error) {
    console.error("Failed to load saved summary:", error);
    setSummaryError(
      error.message || "Failed to load saved summary."
    );
  } finally {
    setIsLoadingSummary(false);
  }
};

const handleSummarize = async () => {
  try {
    setIsSummarizing(true);
    setSummaryError("");

    const result = await summarizeRecording(recording.id);
    const generatedSummary = result.data ?? result;

    setSummary(generatedSummary);
  } catch (error) {
    console.error("AI summarization failed:", error);
    setSummaryError(
      error.message || "Failed to generate AI summary."
    );
  } finally {
    setIsSummarizing(false);
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

<div className="recording-transcript-actions">
  <button
    type="button"
    className="recording-transcript-button"
    onClick={handleTranscribe}
    disabled={isTranscribing || isLoadingTranscript}
  >
    <FileText size={16} />
    {isTranscribing
      ? "Transcribing audio..."
      : "Generate Transcript"}
  </button>

  <button
    type="button"
    className="recording-transcript-load-button"
    onClick={handleLoadTranscript}
    disabled={isTranscribing || isLoadingTranscript}
  >
    <RefreshCw size={16} />
    {isLoadingTranscript ? "Loading..." : "Load Saved Transcript"}
  </button>
</div>


<div className="recording-summary-actions">
  <button
    type="button"
    className="recording-summary-button"
    onClick={handleSummarize}
    disabled={isSummarizing || isLoadingSummary}
  >
    <FileText size={16} />
    {isSummarizing ? "Generating Summary..." : "Generate AI Summary"}
  </button>

  <button
    type="button"
    className="recording-summary-load-button"
    onClick={handleLoadSummary}
    disabled={isSummarizing || isLoadingSummary}
  >
    <RefreshCw size={16} />
    {isLoadingSummary ? "Loading..." : "Load Saved Summary"}
  </button>
</div>

{summaryError && (
  <p className="recording-summary-error" role="alert">
    {summaryError}
  </p>
)}

{summary && (
  <section className="recording-summary-panel">
    <div className="recording-summary-header">
      <h4>
        <FileText size={18} />
        AI Summary
      </h4>

      {summary.model && (
        <span className="recording-summary-model">
          {summary.model}
        </span>
      )}
    </div>

    <div className="recording-summary-text">
      {summary.summary || "No summary content was returned."}
    </div>
  </section>
)}



<div className="meeting-insights-actions">
  <button
    type="button"
    className="meeting-insights-button"
    onClick={handleGenerateMeetingInsights}
    disabled={isGeneratingInsights || isLoadingInsights}
  >
    <ListChecks size={16} />
    {isGeneratingInsights
      ? "Generating Insights..."
      : meetingInsights
        ? "Regenerate Meeting Insights"
        : "Generate Meeting Insights"}
  </button>

  <button
    type="button"
    className="meeting-insights-load-button"
    onClick={handleLoadMeetingInsights}
    disabled={isGeneratingInsights || isLoadingInsights}
  >
    <RefreshCw size={16} />
    {isLoadingInsights ? "Loading..." : "Load Saved Insights"}
  </button>
</div>

{meetingInsightsError && (
  <p className="meeting-insights-error" role="alert">
    {meetingInsightsError}
  </p>
)}

{meetingInsights?.insights && (
  <section className="meeting-insights-panel">
    <div className="meeting-insights-header">
      <h4>
        <ListChecks size={18} />
        Meeting Intelligence
      </h4>

      {meetingInsights.model && (
        <span className="meeting-insights-model">
          {meetingInsights.model}
        </span>
      )}
    </div>

    <div className="meeting-insights-section">
      <h5>Key Points</h5>

      {meetingInsights.insights.keyPoints.length > 0 ? (
        <ul>
          {meetingInsights.insights.keyPoints.map((point, index) => (
            <li key={`${index}-${point}`}>{point}</li>
          ))}
        </ul>
      ) : (
        <p>No key points identified.</p>
      )}
    </div>

    <div className="meeting-insights-section">
      <h5>Decisions</h5>

      {meetingInsights.insights.decisions.length > 0 ? (
        <ul>
          {meetingInsights.insights.decisions.map((decision, index) => (
            <li key={`${index}-${decision}`}>{decision}</li>
          ))}
        </ul>
      ) : (
        <p>No explicit decisions identified.</p>
      )}
    </div>

    <div className="meeting-insights-section">
      <h5>Action Items</h5>

      {meetingInsights.insights.actionItems.length > 0 ? (
        <ul className="meeting-insights-action-list">
          {meetingInsights.insights.actionItems.map((item, index) => (
            <li key={`${index}-${item.task}`}>
              <strong>{item.task}</strong>
              <div>
                Owner: {item.owner || "Not specified"}
              </div>
              <div>
                Deadline: {item.deadline || "Not specified"}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No explicit action items identified.</p>
      )}
    </div>

    {meetingInsights.updatedAt && (
      <p className="meeting-insights-updated">
        Last updated:{" "}
        {new Date(meetingInsights.updatedAt).toLocaleString("en-IN")}
      </p>
    )}
  </section>
)}


<section className="audio-analysis-section">
  <h3>
    <Activity size={18} aria-hidden="true" />
    Audio Emotion &amp; Tone
  </h3>

  <div className="meeting-insights-actions audio-analysis-actions">
  <button
    type="button"
    className="meeting-insights-button"
    onClick={handleAnalyzeAudio}
    disabled={audioAnalysisLoading}
  >
    {audioAnalysisLoading ? "Analyzing audio..." : "Analyze Audio"}
  </button>

  <button
    type="button"
    className="meeting-insights-load-button"
    onClick={handleLoadAudioAnalysis}
    disabled={audioAnalysisLoading}
  >
    Load Saved Analysis
  </button>
</div>

  {audioAnalysisError && (
    <p className="audio-analysis-error" role="alert">
      {audioAnalysisError}
    </p>
  )}

  {audioAnalysis && (
    <div className="audio-analysis-results">
      <h4>Vocal emotion timeline</h4>

      {(
        audioAnalysis.emotion_analysis?.segments ?? []
      ).length === 0 ? (
        <p>No emotion segments were returned.</p>
      ) : (
        <div className="audio-analysis-timeline">
          {audioAnalysis.emotion_analysis.segments.map(
            (segment, index) => (
              <article
                className="audio-analysis-segment"
                key={`${segment.start_seconds}-${index}`}
              >
                <div className="audio-analysis-segment-heading">
                  <strong>
                    {String(segment.emotion ?? "Unknown")}
                  </strong>
                  <span>
                    {Number(segment.start_seconds ?? 0).toFixed(1)}s
                    {" – "}
                    {Number(segment.end_seconds ?? 0).toFixed(1)}s
                  </span>
                </div>

                <p>
                  Confidence:{" "}
                  {Number.isFinite(Number(segment.confidence))
                    ? `${(Number(segment.confidence) * 100).toFixed(1)}%`
                    : "Unavailable"}
                </p>
              </article>
            )
          )}
        </div>
      )}

      <h4>Acoustic characteristics</h4>

      {(audioAnalysis.tone_analysis?.segments ?? []).length === 0 ? (
        <p>No tone measurements were returned.</p>
      ) : (
        <div className="audio-analysis-timeline">
          {audioAnalysis.tone_analysis.segments.map(
            (segment, index) => (
              <article
                className="audio-analysis-segment"
                key={`${segment.start_seconds}-${index}`}
              >
                <strong>
                  {Number(segment.start_seconds ?? 0).toFixed(1)}s
                  {" – "}
                  {Number(segment.end_seconds ?? 0).toFixed(1)}s
                </strong>

                <ul>
                  <li>
                    Median pitch:{" "}
                    {segment.median_pitch_hz == null
                      ? "Unavailable"
                      : `${segment.median_pitch_hz} Hz`}
                  </li>
                  <li>
                    Pitch range (10th–90th percentile):{" "}
                    {segment.pitch_range_hz == null
                      ? "Unavailable"
                      : `${segment.pitch_range_hz.min}–${segment.pitch_range_hz.max} Hz`}
                  </li>
                  <li>
                    Relative loudness:{" "}
                    {segment.mean_loudness_dbfs == null
                      ? "Unavailable"
                      : `${segment.mean_loudness_dbfs} dBFS`}
                  </li>
                  <li>
                    Mean RMS:{" "}
                    {segment.mean_rms == null
                      ? "Unavailable"
                      : segment.mean_rms}
                  </li>
                  <li>
                    Voiced-frame ratio:{" "}
                    {segment.voiced_frame_ratio == null
                      ? "Unavailable"
                      : `${(
                          segment.voiced_frame_ratio * 100
                        ).toFixed(1)}%`}
                  </li>
                </ul>
              </article>
            )
          )}
        </div>
      )}

      <p className="audio-analysis-disclaimer">
        Vocal emotion is an estimate from acoustic patterns and may not
        reflect a person's actual feelings. Pitch and voice activity
        are approximate, and dBFS is relative to the recording—not
        calibrated sound pressure.
      </p>
    </div>
  )}
</section>



{transcriptError && (
  <p className="recording-transcript-error" role="alert">
    {transcriptError}
  </p>
)}

{showTranscript && transcript && (
  <section className="recording-transcript-panel">
    <div className="recording-transcript-header">
      <h4>
        <FileText size={18} />
        Transcript
      </h4>

      <span className="recording-transcript-language">
        <Languages size={14} />
        {(transcript.language || "Unknown").toUpperCase()}
      </span>
    </div>

    {transcript.languageProbability != null && (
      <p className="recording-transcript-confidence">
        Language confidence:{" "}
        {(Number(transcript.languageProbability) * 100).toFixed(1)}%
      </p>
    )}

    <div className="recording-transcript-text">
      {transcript.text || "No transcript text was returned."}
    </div>

    {Array.isArray(transcript.segments) &&
      transcript.segments.length > 0 && (
        <details className="recording-transcript-segments">
          <summary>
            View timestamped segments ({transcript.segments.length})
          </summary>

          {transcript.segments.map((segment, index) => (
            <div
              className="recording-transcript-segment"
              key={`${segment.start}-${index}`}
            >
              <span>
                {formatDuration(segment.start)} â€“{" "}
                {formatDuration(segment.end)}
              </span>

              <p>{segment.text}</p>
            </div>
          ))}
        </details>
      )}
  </section>
)}

<div className="recording-card-player">
  <AudioPlayer recording={recording} />
</div>

    </article>
  );
}

export default RecordingCard;
