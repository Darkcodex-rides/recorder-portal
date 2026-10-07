import {
  Library,
  ListMusic,
  Mic2,
  Search,
} from "lucide-react";

import { useMemo, useState } from "react";

import RecordingList from "../../components/recordings/RecordingList";
import { useRecordingContext } from "../../context/RecordingContext";

function Recordings() {
  const { recordings } = useRecordingContext();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecordings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return recordings;
    }

    return recordings.filter((recording) =>
      recording.name.toLowerCase().includes(query)
    );
  }, [recordings, searchQuery]);

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
            Browse, play, download and manage your
            recorded sessions.
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

      <div className="recordings-search">
        <Search size={17} />

        <input
          type="search"
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
          placeholder="Search recordings..."
          aria-label="Search recordings"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      <div className="recordings-toolbar">
        <div className="recordings-toolbar-left">
          <Mic2 size={16} />
          <span>YOUR RECORDING SESSIONS</span>
        </div>

        <div className="recordings-toolbar-status">
          <span />
          {searchQuery
            ? `${filteredRecordings.length} MATCHES`
            : "LIBRARY READY"}
        </div>
      </div>

      <RecordingList recordings={filteredRecordings} />
    </div>
  );
}

export default Recordings;