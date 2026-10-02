import {
  LayoutDashboard,
  Mic,
  ListVideo,
  Activity,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Mic size={28} />

        <span>Recorder</span>
      </div>

      <nav className="sidebar-nav">
        <a href="/" className="sidebar-link active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </a>

        <a href="/recordings" className="sidebar-link">
          <ListVideo size={20} />
          <span>Recordings</span>
        </a>

        <a href="/observability" className="sidebar-link">
          <Activity size={20} />
          <span>Observability</span>
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;