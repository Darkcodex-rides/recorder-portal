import { Library, ListMusic, Mic2 } from "lucide-react";

import RecordingList from "../../components/recordings/RecordingList";
import { useRecordingContext } from "../../context/RecordingContext";

function Recordings() {
  const { recordings } = useRecordingContext();

  return (
    <div className="recordings-page">
      <div className="recordings-page-header">
        <div>
          <div className="recordings-eyebrow">
            <Library size={13} />
            AUDIO LIBRARY
          </div>

          <h1>Recordings</h1>

          <p>
            Browse, play, download and manage your recorded
            sessions.
          </p>
        </div>

        <div className="recordings-header-stat">
          <div className="recordings-stat-icon">
            <ListMusic size={18} />
          </div>

          <div>
            <span>TOTAL SESSIONS</span>
            <strong>{recordings.length}</strong>
          </div>
        </div>
      </div>

      <div className="recordings-toolbar">
        <div className="recordings-toolbar-left">
          <Mic2 size={16} />
          <span>YOUR RECORDING SESSIONS</span>
        </div>

        <div className="recordings-toolbar-status">
          <span />
          LIBRARY READY
        </div>
      </div>

      <RecordingList />
    </div>
  );
}

export default Recordings;