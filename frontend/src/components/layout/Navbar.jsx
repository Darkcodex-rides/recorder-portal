
import {
  Bell,
  UserCircle,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="navbar">
      <div>
        <h2>Design Recorder</h2>
      </div>

      <div className="navbar-actions">
        {user && (
          <span className="navbar-user">
            {user.name}
          </span>
        )}

        <button
          className="icon-button"
          title="Notifications"
          type="button"
        >
          <Bell size={20} />
        </button>

        <button
          className="icon-button"
          title="Profile"
          type="button"
        >
          <UserCircle size={24} />
        </button>

        <button
          className="logout-button"
          onClick={handleLogout}
          title="Logout"
          type="button"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;