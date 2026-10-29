
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/PurchaseLogin.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ManagerDashboard from "./components/ManagerDashboard.jsx";
import ManagerRegister from "./components/ManagerRegister.jsx";
import "./App.css";

function getRole() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    return JSON.parse(
      atob(
        token
          .split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    ).role;
  } catch {
    return null;
  }
}

function DashboardRouter() {
  const role = getRole();

  if (role === "ADMIN") {
    return <Navigate to="/manager-register" replace />;
  }

  if (role === "MANAGER") {
    return <ManagerDashboard />;
  }

  if (role === "EMPLOYEE") {
    return <Dashboard />;
  }

  return <Navigate to="/" replace />;
}

function AdminRoute() {
  const role = getRole();

  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <ManagerRegister />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/manager-register" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
