import {
  Activity,
  LayoutDashboard,
  ListVideo,
  Mic,
  Radio,
  Trash2,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Mic size={19} />
        </div>

        <div className="sidebar-brand-text">
          <strong>RECORDER</strong>
          <span>STUDIO</span>
        </div>
      </div>

      <div className="sidebar-section-label">
        WORKSPACE
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar-link ${
              isActive ? "active" : ""
            }`
          }
        >
          <span className="sidebar-link-icon">
            <LayoutDashboard size={18} />
          </span>

          <span className="sidebar-link-content">
            <strong>Dashboard</strong>
            <small>Record audio</small>
          </span>
        </NavLink>

        <NavLink
          to="/recordings"
          className={({ isActive }) =>
            `sidebar-link ${
              isActive ? "active" : ""
            }`
          }
        >
          <span className="sidebar-link-icon">
            <ListVideo size={18} />
          </span>

          <span className="sidebar-link-content">
            <strong>Recordings</strong>
            <small>Audio library</small>
          </span>
        </NavLink>

        <NavLink
  to="/trash"
  className={({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`
  }
>
  <span className="sidebar-link-icon">
    <Trash2 size={18} />
  </span>

  <span className="sidebar-link-content">
    <strong>Trash</strong>
    <small>Deleted recordings</small>
  </span>
</NavLink>

        <NavLink
          to="/observability"
          className={({ isActive }) =>
            `sidebar-link ${
              isActive ? "active" : ""
            }`
          }
        >
          <span className="sidebar-link-icon">
            <Activity size={18} />
          </span>

          <span className="sidebar-link-content">
            <strong>Observability</strong>
            <small>System monitoring</small>
          </span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-system-card">
          <div className="system-icon">
            <Radio size={16} />
          </div>

          <div>
            <strong>System online</strong>
            <span>
              Recording services ready
            </span>
          </div>

          <span className="system-online-dot" />
        </div>

        <div className="sidebar-footer">
          DESIGN RECORDER
          <span>v1.0</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;