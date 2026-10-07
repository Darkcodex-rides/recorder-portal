import RecordingCard from "./RecordingCard";
import { useRecordingContext } from "../../context/RecordingContext";

function RecordingList({ recordings }) {
  const { isLoading } = useRecordingContext();

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
        <p>No recordings found.</p>

        <p>
          Try a different search or start a new recording
          from the Dashboard.
        </p>
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