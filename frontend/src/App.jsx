
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/PurchaseLogin.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ManagerDashboard from "./components/ManagerDashboard.jsx";
import "./App.css";

function getRole() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const base64 = token
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(atob(base64));
    return payload.role;
  } catch {
    return null;
  }
}

function DashboardRouter() {
  const role = getRole();

  if (role === "MANAGER") {
    return <ManagerDashboard />;
  }

  if (role === "EMPLOYEE") {
    return <Dashboard />;
  }

  return <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
