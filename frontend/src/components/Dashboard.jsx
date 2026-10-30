
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateRequest from "./CreateRequest.jsx";
import Chatbot from "./Chatbot.jsx";

function getUserIdFromToken(token) {
  try {
    const base64 = token
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(atob(base64));
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadRequests() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const employeeId = getUserIdFromToken(token);

      if (employeeId == null) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/requests/employee/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not load purchase requests"
          );
        }

        setRequests(data);
      } catch (err) {
        setError(err.message || "Failed to connect to the server");
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  function handleRequestCreated(createdRequest) {
    setRequests((previousRequests) => [
      createdRequest,
      ...previousRequests,
    ]);

    setShowRequestForm(false);
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <h1>Purchase Request System</h1>
          <p>Employee Dashboard</p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-actions">
          <h2>My Purchase Requests</h2>

          <button
            className="create-request-button"
            onClick={() =>
              setShowRequestForm((previous) => !previous)
            }
          >
            {showRequestForm ? "Cancel" : "+ Create New Request"}
          </button>
        </div>

        {showRequestForm && (
          <CreateRequest onCreated={handleRequestCreated} />
        )}

        {loading && (
          <p className="dashboard-message">
            Loading requests...
          </p>
        )}

        {error && (
          <p className="dashboard-error">{error}</p>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="empty-state">
            <h3>No purchase requests yet</h3>
            <p>Create your first request to get started.</p>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="request-grid">
            {requests.map((request) => (
              <article
                className="request-card"
                key={request.id}
              >
                <div className="request-card-heading">
                  <h3>{request.itemName}</h3>

                  <span
                    className={`request-status ${
                      request.status?.toLowerCase()
                    }`}
                  >
                    {request.status}
                  </span>
                </div>

                <p className="request-description">
                  {request.description}
                </p>

                <p>
                  <strong>Quantity:</strong> {request.quantity}
                </p>

                <p>
                  <strong>Amount:</strong>{" "}
                  ₹{Number(request.amount).toLocaleString("en-IN")}
                </p>

                <p>
                  <strong>Reason:</strong> {request.reason}
                </p>

                <p className="request-id">
                  <strong>Request ID:</strong> #{request.id}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <Chatbot />
    </main>
  );
}

export default Dashboard;
