import RecordingList from "../../components/recordings/RecordingList";

function Recordings() {
  return (
    <div>
      <h1>Recordings</h1>

      <p className="page-description">
        View and manage your recorded sessions.
      </p>

      <RecordingList />
    </div>
  );
}

export default Recordings;