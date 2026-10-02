import { Bell, UserCircle } from "lucide-react";

function Navbar() {
  return (
    <header className="navbar">
      <div>
        <h2>Design Recorder</h2>
      </div>

      <div className="navbar-actions">
        <button className="icon-button">
          <Bell size={20} />
        </button>

        <button className="icon-button">
          <UserCircle size={24} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;