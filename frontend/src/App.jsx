
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Recordings from "./pages/Recordings/Recordings";
import Observability from "./pages/Observability/Observability";
import Trash from "./pages/Trash/Trash";

import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated, isInitializing } = useAuth();

  // Wait until authentication state is restored
  if (isInitializing) {
    return (
      <div className="app-loading">
        <p>Loading...</p>
      </div>
    );
  }

  // Not authenticated → Login
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/recordings"
            element={<Recordings />}
          />

          <Route path="/trash" element={<Trash />} />

          <Route
            path="/observability"
            element={<Observability />}
          />

          {/* Unknown route → Dashboard */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
