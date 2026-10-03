import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Recordings from "./pages/Recordings/Recordings";
import Observability from "./pages/Observability/Observability";

import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recordings" element={<Recordings />} />
          <Route
            path="/observability"
            element={<Observability />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;