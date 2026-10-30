import Chatbot from "./Chatbot.jsx";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function ManagerDashboard() {
    const [refreshing, setRefreshing] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    // Read the manager's ID and team ID from the JWT.
    function getTokenPayload(jwt) {
        try {
            const base64 = jwt.split(".")[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");
            return JSON.parse(atob(base64));
        } catch {
            return null;
        }
    }

    const payload = token ? getTokenPayload(token) : null;
    const teamId = payload?.teamId;

    const loadRequests = useCallback(async () => {
        if (!token) {
            navigate("/");
            return;
        }

        if (!teamId) {
            setError("Your login token does not contain a team ID.");
            setLoading(false);
            setRefreshing(false);
            return;
        }

        setRefreshing(true);

        try {
            setError("");

            const response = await fetch(
                `http://localhost:8080/api/requests/team/${teamId}/pending`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Could not load pending requests"
                );
            }

            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Failed to connect to the server");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [navigate, teamId, token]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    async function handleReview(requestId, action) {
        setActionError("");

        if (action === "reject") {
            if (rejectingId !== requestId) {
                setRejectingId(requestId);
                setRejectionReason("");
                return;
            }

            if (!rejectionReason.trim()) {
                setActionError("Please enter a reason for rejection.");
                return;
            }
        }

        setProcessingId(requestId);

        try {
            const response = await fetch(
                `http://localhost:8080/api/requests/${requestId}/${action}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    ...(action === "reject"
                        ? {
                            body: JSON.stringify({
                                rejectionReason: rejectionReason.trim(),
                            }),
                        }
                        : {}),
                }
            );

            const text = await response.text();
            let data = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = { message: text };
            }

            if (!response.ok) {
                throw new Error(
                    data.error || data.message || `Could not ${action} request`
                );
            }

            setRejectingId(null);
            setRejectionReason("");
            await loadRequests();
        } catch (err) {
            setActionError(err.message || "Request review failed");
        } finally {
            setProcessingId(null);
        }
    }

    function handleLogout() {
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <main className="dashboard-page">
            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <h1>Purchase Request System</h1>
                    <p>Manager Dashboard</p>
                </div>

                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </header>

            <section className="dashboard-content">
                <div className="dashboard-actions">
                    <h2>Pending Team Requests</h2>

                    <button
                        className="create-request-button refresh-button"
                        onClick={loadRequests}
                        disabled={refreshing}
                    >
                        <span className={refreshing ? "refresh-icon spinning" : "refresh-icon"}>
                            ↻
                        </span>
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {loading && (
                    <p className="dashboard-message">Loading requests...</p>
                )}

                {error && (
                    <p className="dashboard-error">{error}</p>
                )}

                {actionError && (
                    <p className="dashboard-error">{actionError}</p>
                )}

                {!loading && !error && requests.length === 0 && (
                    <div className="empty-state">
                        <h3>No pending requests</h3>
                        <p>Your team has no requests waiting for review.</p>
                    </div>
                )}

                {!loading && !error && requests.length > 0 && (
                    <div className="request-grid">
                        {requests.map((request) => (
                            <article className="request-card" key={request.id}>
                                <div className="request-card-heading">
                                    <h3>{request.itemName}</h3>
                                    <span className="request-status pending">
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

                                {rejectingId === request.id && (
                                    <div className="reject-form">
                                        <label htmlFor={`reject-${request.id}`}>
                                            Rejection reason
                                        </label>

                                        <textarea
                                            id={`reject-${request.id}`}
                                            value={rejectionReason}
                                            onChange={(event) =>
                                                setRejectionReason(event.target.value)
                                            }
                                            placeholder="Explain why this request is rejected"
                                            rows={3}
                                        />
                                    </div>
                                )}

                                <div className="manager-actions">
                                    <button
                                        className="approve-button"
                                        disabled={processingId === request.id}
                                        onClick={() => handleReview(request.id, "approve")}
                                    >
                                        {processingId === request.id
                                            ? "Processing..."
                                            : "Approve"}
                                    </button>

                                    {rejectingId === request.id ? (
                                        <>
                                            <button
                                                className="reject-button"
                                                disabled={processingId === request.id}
                                                onClick={() => handleReview(request.id, "reject")}
                                            >
                                                Confirm Rejection
                                            </button>

                                            <button
                                                className="cancel-button"
                                                disabled={processingId === request.id}
                                                onClick={() => {
                                                    setRejectingId(null);
                                                    setRejectionReason("");
                                                    setActionError("");
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="reject-button"
                                            disabled={processingId === request.id}
                                            onClick={() => handleReview(request.id, "reject")}
                                        >
                                            Reject
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
            <Chatbot />
        </main>
    );
}

export default ManagerDashboard;
