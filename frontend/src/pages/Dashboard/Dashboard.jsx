import AudioRecorder from "../../components/recorder/AudioRecorder";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <p className="page-description">
        Record and manage your application sessions.
      </p>

      <AudioRecorder />
    </div>
  );
}

export default Dashboard;