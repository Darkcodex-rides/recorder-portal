import {
  Bell,
  CircleUserRound,
  LogOut,
  Mic2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="mobile-brand-icon">
          <Mic2 size={17} />
        </div>

        <div className="navbar-title">
          <span>DESIGN RECORDER</span>
          <small>CONTROL ROOM</small>
        </div>
      </div>

      <div className="navbar-actions">
        {user && (
          <div className="navbar-user">
            <span className="navbar-user-status" />

            <span>
              {user.name}
            </span>
          </div>
        )}

        <button
          className="icon-button"
          title="Notifications"
          type="button"
        >
          <Bell size={18} />

          <span className="notification-dot" />
        </button>

        <button
          className="icon-button profile-button"
          title="Profile"
          type="button"
        >
          <CircleUserRound size={21} />
        </button>

        <button
          className="logout-button"
          onClick={handleLogout}
          title="Logout"
          type="button"
        >
          <LogOut size={18} />

          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;