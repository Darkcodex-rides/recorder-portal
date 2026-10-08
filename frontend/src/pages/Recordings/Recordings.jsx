
import {
  ArrowDownAZ,
  ArrowDownUp,
  ArrowUpAZ,
  Clock3,
  Filter,
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
  const [durationFilter, setDurationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredRecordings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = recordings.filter((recording) => {
      const matchesSearch =
        !query ||
        recording.name.toLowerCase().includes(query);

      const duration = Number(recording.duration) || 0;

      const matchesDuration =
        durationFilter === "all" ||
        (durationFilter === "short" && duration <= 60) ||
        (durationFilter === "long" && duration > 60);

      return matchesSearch && matchesDuration;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.created_at) -
            new Date(b.created_at)
          );

        case "name-asc":
          return a.name.localeCompare(b.name);

        case "name-desc":
          return b.name.localeCompare(a.name);

        case "duration-asc":
          return (
            (Number(a.duration) || 0) -
            (Number(b.duration) || 0)
          );

        case "duration-desc":
          return (
            (Number(b.duration) || 0) -
            (Number(a.duration) || 0)
          );

        case "newest":
        default:
          return (
            new Date(b.created_at) -
            new Date(a.created_at)
          );
      }
    });

    return result;
  }, [
    recordings,
    searchQuery,
    durationFilter,
    sortBy,
  ]);

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

      <div className="recordings-library-controls">
        <div className="recordings-control">
          <Filter size={15} />

          <label htmlFor="duration-filter">
            FILTER
          </label>

          <select
            id="duration-filter"
            value={durationFilter}
            onChange={(event) =>
              setDurationFilter(event.target.value)
            }
          >
            <option value="all">All recordings</option>
            <option value="short">
              Short · 60s or less
            </option>
            <option value="long">
              Long · Over 60s
            </option>
          </select>
        </div>

        <div className="recordings-control">
          {sortBy === "name-asc" ||
          sortBy === "name-desc" ? (
            sortBy === "name-asc" ? (
              <ArrowDownAZ size={15} />
            ) : (
              <ArrowUpAZ size={15} />
            )
          ) : sortBy === "duration-asc" ||
            sortBy === "duration-desc" ? (
            <Clock3 size={15} />
          ) : (
            <ArrowDownUp size={15} />
          )}

          <label htmlFor="recordings-sort">
            SORT
          </label>

          <select
            id="recordings-sort"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name-asc">Name A → Z</option>
            <option value="name-desc">Name Z → A</option>
            <option value="duration-asc">
              Duration shortest
            </option>
            <option value="duration-desc">
              Duration longest
            </option>
          </select>
        </div>
      </div>

      <div className="recordings-toolbar">
        <div className="recordings-toolbar-left">
          <Mic2 size={16} />
          <span>YOUR RECORDING SESSIONS</span>
        </div>

        <div className="recordings-toolbar-status">
          <span />

          {searchQuery ||
          durationFilter !== "all" ||
          sortBy !== "newest"
            ? `${filteredRecordings.length} RESULTS`
            : "LIBRARY READY"}
        </div>
      </div>

      <RecordingList recordings={filteredRecordings} />
    </div>
  );
}

export default Recordings;
