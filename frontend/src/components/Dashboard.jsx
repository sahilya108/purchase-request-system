
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateRequest from "./CreateRequest.jsx";
import Chatbot from "./Chatbot.jsx";

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Filter states
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const navigate = useNavigate();

  async function loadRequests(filters = {}) {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (filters.status) {
        params.append("status", filters.status);
      }

      if (filters.fromDate) {
        params.append("fromDate", filters.fromDate);
      }

      if (filters.toDate) {
        params.append("toDate", filters.toDate);
      }

      const queryString = params.toString();

      const response = await fetch(
        `http://localhost:8080/api/requests/filter${
          queryString ? `?${queryString}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Could not load purchase requests"
        );
      }

      setRequests(data);
    } catch (err) {
      setError(err.message || "Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

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

  function handleApplyFilters(event) {
    event.preventDefault();

    if (fromDate && toDate && fromDate > toDate) {
      setError("From date cannot be after To date.");
      return;
    }

    loadRequests({
      status,
      fromDate,
      toDate,
    });
  }

  function handleResetFilters() {
    setStatus("");
    setFromDate("");
    setToDate("");

    loadRequests();
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

        {/* Request Filters */}
        <form
          className="request-filters"
          onSubmit={handleApplyFilters}
        >
          <div className="filter-group">
            <label htmlFor="request-status">Status</label>

            <select
              id="request-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="from-date">From Date</label>

            <input
              id="from-date"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="to-date">To Date</label>

            <input
              id="to-date"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button
              type="submit"
              className="apply-filter-button"
              disabled={loading}
            >
              Apply Filters
            </button>

            <button
              type="button"
              className="reset-filter-button"
              onClick={handleResetFilters}
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>

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
            <h3>No purchase requests found</h3>
            <p>
              Try changing your filters or create a new request.
            </p>
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
