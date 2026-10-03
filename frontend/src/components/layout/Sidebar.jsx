import {
  LayoutDashboard,
  Mic,
  ListVideo,
  Activity,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Mic size={28} />

        <span>Recorder</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/recordings"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <ListVideo size={20} />
          <span>Recordings</span>
        </NavLink>

        <NavLink
          to="/observability"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <Activity size={20} />
          <span>Observability</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;