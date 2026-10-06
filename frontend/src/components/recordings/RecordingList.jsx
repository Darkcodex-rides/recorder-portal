import RecordingCard from "./RecordingCard";
import { useRecordingContext } from "../../context/RecordingContext";

function RecordingList() {
  const { recordings, isLoading } = useRecordingContext();

  if (isLoading) {
    return (
      <div className="recordings-loading">
        Loading recordings...
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="empty-recordings">
        <p>No recordings yet.</p>
        <p>Start a recording from the Dashboard to see it here.</p>
      </div>
    );
  }

  return (
    <section className="recordings-section">
      <div className="recordings-list">
        {recordings.map((recording) => (
          <RecordingCard
            key={recording.id}
            recording={recording}
          />
        ))}
      </div>
    </section>
  );
}

export default RecordingList;