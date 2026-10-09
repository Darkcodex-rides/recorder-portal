
import { useEffect, useState } from "react";
import { RotateCcw, Trash2, LoaderCircle } from "lucide-react";
import { useRecordingContext } from "../../context/RecordingContext";

function Trash() {
  const {
    trashedRecordings,
    isTrashLoading,
    loadTrashedRecordings,
    restoreRecording,
  } = useRecordingContext();

  const [restoringId, setRestoringId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
  loadTrashedRecordings().catch(() => {
    setError("Could not load trashed recordings. Please try again.");
  });
}, [loadTrashedRecordings]);

  const handleRestore = async (id) => {
    setError("");
    setRestoringId(id);

    try {
      await restoreRecording(id);
    } catch (err) {
      console.error("Failed to restore recording:", err);
      setError("Could not restore this recording. Please try again.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <section className="page-container">
      <div className="page-header">
        <div>
          <h1>Trash</h1>
          <p>Restore recordings you have moved to trash.</p>
        </div>

        <Trash2 size={28} />
      </div>

      {error && <p role="alert">{error}</p>}

      {isTrashLoading ? (
        <div className="empty-state">
          <LoaderCircle size={28} />
          <p>Loading trash...</p>
        </div>
      ) : trashedRecordings.length === 0 ? (
        <div className="empty-state">
          <Trash2 size={32} />
          <h2>Trash is empty</h2>
          <p>Recordings you delete will appear here.</p>
        </div>
      ) : (
        <div className="recordings-list">
          {trashedRecordings.map((recording) => (
            <article className="recording-card" key={recording.id}>
              <div>
                <h3>{recording.name}</h3>
                <p>
                  Deleted{" "}
                  {recording.deleted_at
                    ? new Date(recording.deleted_at).toLocaleString()
                    : "recently"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRestore(recording.id)}
                disabled={restoringId === recording.id}
              >
                <RotateCcw size={16} />
                {restoringId === recording.id
                  ? "Restoring..."
                  : "Restore"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Trash;
