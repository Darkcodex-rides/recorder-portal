import AudioRecorder from "../../components/recorder/AudioRecorder";
import RecordingList from "../../components/recordings/RecordingList";
import useWebSocket from "../../hooks/useWebSocket";

function Dashboard() {
  const { sendMessage } = useWebSocket();

  return (
    <div>
      <h1>Dashboard</h1>

      <p className="page-description">
        Record and manage your application sessions.
      </p>

      <AudioRecorder />

      <RecordingList />

      
    </div>
  );
}

export default Dashboard;