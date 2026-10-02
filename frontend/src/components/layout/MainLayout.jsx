import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Dashboard from "../../pages/Dashboard/Dashboard";

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-section">
        <Navbar />

        <main className="main-content">
          <div className="page-container">
            <Dashboard />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;