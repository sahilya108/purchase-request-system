
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chatbot from "./Chatbot.jsx";

function ManagerDashboard() {
    const [refreshing, setRefreshing] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Filter states
    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [employeeId, setEmployeeId] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Load requests using the backend filtering API
    async function loadRequests(filters = {}) {
        if (!token) {
            navigate("/");
            return;
        }

        setRefreshing(true);
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

            if (filters.employeeId) {
                params.append("employeeId", filters.employeeId);
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
                    cache: "no-store",
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

            setRequests(Array.isArray(data) ? data : []);

        } catch (err) {
            setError(err.message || "Failed to connect to the server");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadRequests();
    }, []);

    // Apply filters
    function handleApplyFilters(event) {
        event.preventDefault();

        if (fromDate && toDate && fromDate > toDate) {
            setError("From date cannot be after To date.");
            return;
        }

        if (
            employeeId.trim() &&
            (!/^\d+$/.test(employeeId.trim()) ||
                Number(employeeId) <= 0)
        ) {
            setError("Please enter a valid Employee ID.");
            return;
        }

        loadRequests({
            status,
            fromDate,
            toDate,
            employeeId: employeeId.trim(),
        });
    }

    // Reset filters
    function handleResetFilters() {
        setStatus("");
        setFromDate("");
        setToDate("");
        setEmployeeId("");

        loadRequests();
    }

    // Approve or reject request
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
                    data.error ||
                    data.message ||
                    `Could not ${action} request`
                );
            }

            setRejectingId(null);
            setRejectionReason("");

            // Reload requests with currently applied filters
            await loadRequests({
                status,
                fromDate,
                toDate,
                employeeId: employeeId.trim(),
            });

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

            {/* Header */}
            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <h1>Purchase Request System</h1>
                    <p>Manager Dashboard</p>
                </div>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <section className="dashboard-content">

                {/* Dashboard Heading */}
                <div className="dashboard-actions">
                    <h2>Team Purchase Requests</h2>

                    <button
                        className="create-request-button refresh-button"
                        onClick={() =>
                            loadRequests({
                                status,
                                fromDate,
                                toDate,
                                employeeId: employeeId.trim(),
                            })
                        }
                        disabled={refreshing}
                    >
                        <span className={
                            refreshing
                                ? "refresh-icon spinning"
                                : "refresh-icon"
                        }>
                            ↻
                        </span>

                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Filters */}
                <form
                    className="request-filters"
                    onSubmit={handleApplyFilters}
                >
                    <div className="filter-group">
                        <label htmlFor="manager-status">
                            Status
                        </label>

                        <select
                            id="manager-status"
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="manager-from-date">
                            From Date
                        </label>

                        <input
                            id="manager-from-date"
                            type="date"
                            value={fromDate}
                            max={toDate || undefined}
                            onChange={(event) =>
                                setFromDate(event.target.value)
                            }
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="manager-to-date">
                            To Date
                        </label>

                        <input
                            id="manager-to-date"
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={(event) =>
                                setToDate(event.target.value)
                            }
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="employee-id">
                            Employee ID
                        </label>

                        <input
                            id="employee-id"
                            type="number"
                            min="1"
                            placeholder="Enter Employee ID"
                            value={employeeId}
                            onChange={(event) =>
                                setEmployeeId(event.target.value)
                            }
                        />
                    </div>

                    <div className="filter-buttons">
                        <button
                            type="submit"
                            className="apply-filter-button"
                            disabled={refreshing}
                        >
                            Apply Filters
                        </button>

                        <button
                            type="button"
                            className="reset-filter-button"
                            onClick={handleResetFilters}
                            disabled={refreshing}
                        >
                            Reset
                        </button>
                    </div>
                </form>

                {/* Loading */}
                {loading && (
                    <p className="dashboard-message">
                        Loading requests...
                    </p>
                )}

                {/* Errors */}
                {error && (
                    <p className="dashboard-error">{error}</p>
                )}

                {actionError && (
                    <p className="dashboard-error">{actionError}</p>
                )}

                {/* Empty State */}
                {!loading && !error && requests.length === 0 && (
                    <div className="empty-state">
                        <h3>No purchase requests found</h3>
                        <p>
                            Try changing your filters or Employee ID.
                        </p>
                    </div>
                )}

                {/* Request Cards */}
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
                                    <strong>Employee ID:</strong>{" "}
                                    {request.employeeId}
                                </p>

                                <p>
                                    <strong>Quantity:</strong>{" "}
                                    {request.quantity}
                                </p>

                                <p>
                                    <strong>Amount:</strong>{" "}
                                    ₹{Number(request.amount).toLocaleString("en-IN")}
                                </p>

                                <p>
                                    <strong>Reason:</strong>{" "}
                                    {request.reason}
                                </p>

                                <p className="request-id">
                                    <strong>Request ID:</strong>{" "}
                                    #{request.id}
                                </p>

                                {request.createdAt && (
                                    <p>
                                        <strong>Created At:</strong>{" "}
                                        {new Date(request.createdAt).toLocaleString("en-IN")}
                                    </p>
                                )}

                                {request.status === "REJECTED" &&
                                    request.rejectionReason && (
                                        <p>
                                            <strong>Rejection Reason:</strong>{" "}
                                            {request.rejectionReason}
                                        </p>
                                    )}

                                {/* Review controls only for pending requests */}
                                {request.status === "PENDING" && (
                                    <>
                                        {rejectingId === request.id && (
                                            <div className="reject-form">
                                                <label
                                                    htmlFor={`reject-${request.id}`}
                                                >
                                                    Rejection reason
                                                </label>

                                                <textarea
                                                    id={`reject-${request.id}`}
                                                    value={rejectionReason}
                                                    onChange={(event) =>
                                                        setRejectionReason(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="Explain why this request is rejected"
                                                    rows={3}
                                                />
                                            </div>
                                        )}

                                        <div className="manager-actions">

                                            <button
                                                className="approve-button"
                                                disabled={
                                                    processingId === request.id
                                                }
                                                onClick={() =>
                                                    handleReview(
                                                        request.id,
                                                        "approve"
                                                    )
                                                }
                                            >
                                                {processingId === request.id
                                                    ? "Processing..."
                                                    : "Approve"}
                                            </button>

                                            {rejectingId === request.id ? (
                                                <>
                                                    <button
                                                        className="reject-button"
                                                        disabled={
                                                            processingId === request.id
                                                        }
                                                        onClick={() =>
                                                            handleReview(
                                                                request.id,
                                                                "reject"
                                                            )
                                                        }
                                                    >
                                                        Confirm Rejection
                                                    </button>

                                                    <button
                                                        className="cancel-button"
                                                        disabled={
                                                            processingId === request.id
                                                        }
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
                                                    disabled={
                                                        processingId === request.id
                                                    }
                                                    onClick={() =>
                                                        handleReview(
                                                            request.id,
                                                            "reject"
                                                        )
                                                    }
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
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
