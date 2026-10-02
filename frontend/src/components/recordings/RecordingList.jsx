import RecordingCard from "./RecordingCard";
import { useRecordingContext } from "../../context/RecordingContext";

function RecordingList() {
  const { recordings } = useRecordingContext();

  return (
    <section className="recordings-section">
      <div className="section-header">
        <h2>My Recordings</h2>

        <span>
          {recordings.length} recording
          {recordings.length !== 1 ? "s" : ""}
        </span>
      </div>

      {recordings.length === 0 ? (
        <div className="empty-recordings">
          <p>No recordings yet.</p>
          <p>Start a recording to see it here.</p>
        </div>
      ) : (
        <div className="recordings-list">
          {recordings.map((recording) => (
            <RecordingCard
              key={recording.id}
              recording={recording}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default RecordingList;