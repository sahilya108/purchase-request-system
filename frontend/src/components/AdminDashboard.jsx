
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerRegister from "./ManagerRegister.jsx";

function AdminDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [activeSection, setActiveSection] = useState("requests");

    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [requestsError, setRequestsError] = useState("");

    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [employeeId, setEmployeeId] = useState("");

    const [teams, setTeams] = useState([]);
    const [teamsLoading, setTeamsLoading] = useState(false);
    const [teamsError, setTeamsError] = useState("");

    const [teamName, setTeamName] = useState("");
    const [teamMessage, setTeamMessage] = useState("");
    const [teamError, setTeamError] = useState("");
    const [creatingTeam, setCreatingTeam] = useState(false);

    // Load all purchase requests for admin
    async function loadRequests(filters = {}) {
        if (!token) {
            navigate("/");
            return;
        }

        setRequestsLoading(true);
        setRequestsError("");

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
                `http://localhost:8080/api/requests/admin/filter${queryString ? `?${queryString}` : ""
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
            setRequestsError(
                err.message || "Failed to connect to the server"
            );
        } finally {
            setRequestsLoading(false);
        }
    }

    // Load all teams
    async function loadTeams() {
        if (!token) {
            navigate("/");
            return;
        }

        setTeamsLoading(true);
        setTeamsError("");

        try {
            const response = await fetch(
                "http://localhost:8080/api/admin/teams",
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
                    "Could not load teams"
                );
            }

            setTeams(Array.isArray(data) ? data : []);
        } catch (err) {
            setTeamsError(err.message || "Failed to load teams");
        } finally {
            setTeamsLoading(false);
        }
    }

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        loadRequests();
        loadTeams();
    }, []);

    // Apply purchase request filters
    function handleApplyFilters(event) {
        event.preventDefault();

        if (fromDate && toDate && fromDate > toDate) {
            setRequestsError("From date cannot be after To date.");
            return;
        }

        if (
            employeeId.trim() &&
            (!/^\d+$/.test(employeeId.trim()) ||
                Number(employeeId) <= 0)
        ) {
            setRequestsError("Please enter a valid Employee ID.");
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

    // Create new team
    async function handleCreateTeam(event) {
        event.preventDefault();

        setTeamMessage("");
        setTeamError("");

        const trimmedName = teamName.trim();

        if (!trimmedName) {
            setTeamError("Please enter a team name.");
            return;
        }

        setCreatingTeam(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/admin/teams",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        teamName: trimmedName,
                    }),
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
                    data.message ||
                    data.error ||
                    text ||
                    "Could not create team"
                );
            }

            setTeamMessage(
                `Team "${data.teamName || trimmedName}" created successfully.`
            );

            setTeamName("");

            await loadTeams();
        } catch (err) {
            setTeamError(err.message || "Failed to create team");
        } finally {
            setCreatingTeam(false);
        }
    }

    // Logout
    function handleLogout() {
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <main className="dashboard-page">

            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <h1>Purchase Request System</h1>
                    <p>Admin Dashboard</p>
                </div>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <section className="dashboard-content">

                <div className="admin-nav">
                    <button
                        className={
                            activeSection === "requests"
                                ? "admin-nav-button active"
                                : "admin-nav-button"
                        }
                        onClick={() => setActiveSection("requests")}
                    >
                        All Purchase Requests
                    </button>

                    <button
                        className={
                            activeSection === "manager"
                                ? "admin-nav-button active"
                                : "admin-nav-button"
                        }
                        onClick={() => setActiveSection("manager")}
                    >
                        Manager Registration
                    </button>

                    <button
                        className={
                            activeSection === "teams"
                                ? "admin-nav-button active"
                                : "admin-nav-button"
                        }
                        onClick={() => {
                            setActiveSection("teams");
                            loadTeams();
                        }}
                    >
                        Show Teams
                    </button>

                    <button
                        className={
                            activeSection === "create-team"
                                ? "admin-nav-button active"
                                : "admin-nav-button"
                        }
                        onClick={() => {
                            setActiveSection("create-team");
                            setTeamMessage("");
                            setTeamError("");
                        }}
                    >
                        + Create New Team
                    </button>
                </div>

                {/* ALL PURCHASE REQUESTS */}
                {activeSection === "requests" && (
                    <>
                        <div className="dashboard-actions">
                            <h2>All Purchase Requests</h2>

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
                                disabled={requestsLoading}
                            >
                                ↻ {requestsLoading ? "Refreshing..." : "Refresh"}
                            </button>
                        </div>

                        <form
                            className="request-filters"
                            onSubmit={handleApplyFilters}
                        >
                            <div className="filter-group">
                                <label htmlFor="admin-status">Status</label>
                                <select
                                    id="admin-status"
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
                                <label htmlFor="admin-from-date">From Date</label>
                                <input
                                    id="admin-from-date"
                                    type="date"
                                    value={fromDate}
                                    max={toDate || undefined}
                                    onChange={(event) =>
                                        setFromDate(event.target.value)
                                    }
                                />
                            </div>

                            <div className="filter-group">
                                <label htmlFor="admin-to-date">To Date</label>
                                <input
                                    id="admin-to-date"
                                    type="date"
                                    value={toDate}
                                    min={fromDate || undefined}
                                    onChange={(event) =>
                                        setToDate(event.target.value)
                                    }
                                />
                            </div>

                            <div className="filter-group">
                                <label htmlFor="admin-employee-id">
                                    Employee ID
                                </label>
                                <input
                                    id="admin-employee-id"
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
                                    disabled={requestsLoading}
                                >
                                    Apply Filters
                                </button>

                                <button
                                    type="button"
                                    className="reset-filter-button"
                                    onClick={handleResetFilters}
                                    disabled={requestsLoading}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>

                        {requestsLoading && (
                            <p className="dashboard-message">
                                Loading requests...
                            </p>
                        )}

                        {requestsError && (
                            <p className="dashboard-error">
                                {requestsError}
                            </p>
                        )}

                        {!requestsLoading &&
                            !requestsError &&
                            requests.length === 0 && (
                                <div className="empty-state">
                                    <h3>No purchase requests found</h3>
                                    <p>Try changing your filters.</p>
                                </div>
                            )}

                        {!requestsLoading &&
                            !requestsError &&
                            requests.length > 0 && (

                                <div className="request-grid">
                                    {requests.map((request) => (
                                        <article
                                            className="request-card"
                                            key={request.id}
                                        >
                                            <div className="request-card-heading">
                                                <h3>{request.itemName}</h3>

                                                <span
                                                    className={`request-status ${request.status?.toLowerCase()
                                                        }`}
                                                >
                                                    {request.status}
                                                </span>
                                            </div>

                                            <p className="request-description">
                                                {request.description}
                                            </p>

                                            <p>
                                                <strong>Request ID:</strong> #{request.id}
                                            </p>

                                            <p>
                                                <strong>Employee ID:</strong> {request.employeeId}
                                            </p>

                                            <p>
                                                <strong>Team ID:</strong> {request.teamId}
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

                                            {request.createdAt && (
                                                <p>
                                                    <strong>Created At:</strong>{" "}
                                                    {new Date(request.createdAt).toLocaleString("en-IN")}
                                                </p>
                                            )}

                                            {request.status !== "PENDING" && (
                                                <>
                                                    <p className="admin-review-detail manager-id">
                                                        <strong>Handled By Manager ID:</strong>{" "}
                                                        {request.managerId ?? "Not available"}
                                                    </p>

                                                    {request.reviewedAt && (
                                                        <p className="admin-review-detail reviewed-at">
                                                            <strong>Reviewed At:</strong>{" "}
                                                            {new Date(request.reviewedAt).toLocaleString("en-IN")}
                                                        </p>
                                                    )}
                                                </>
                                            )}

                                            {request.status === "REJECTED" &&
                                                request.rejectionReason && (
                                                    <p className="admin-review-detail rejection-reason">
                                                        <strong>Rejection Reason:</strong>{" "}
                                                        {request.rejectionReason}
                                                    </p>
                                                )}
                                        </article>
                                    ))}
                                </div>

                            )}
                    </>
                )}

                {/* MANAGER REGISTRATION */}
                {activeSection === "manager" && (
                    <div className="admin-manager-section">
                        <ManagerRegister />
                    </div>
                )}

                {/* SHOW TEAMS */}
                {activeSection === "teams" && (
                    <>
                        <div className="dashboard-actions">
                            <h2>All Teams</h2>

                            <button
                                className="create-request-button refresh-button"
                                onClick={loadTeams}
                                disabled={teamsLoading}
                            >
                                ↻ {teamsLoading ? "Refreshing..." : "Refresh"}
                            </button>
                        </div>

                        {teamsLoading && (
                            <p className="dashboard-message">
                                Loading teams...
                            </p>
                        )}

                        {teamsError && (
                            <p className="dashboard-error">
                                {teamsError}
                            </p>
                        )}

                        {!teamsLoading &&
                            !teamsError &&
                            teams.length === 0 && (
                                <div className="empty-state">
                                    <h3>No teams found</h3>
                                </div>
                            )}

                        {!teamsLoading &&
                            !teamsError &&
                            teams.length > 0 && (
                                <div className="admin-team-list">
                                    {teams.map((team) => (
                                        <div
                                            className="admin-team-row"
                                            key={team.id}
                                        >
                                            <div>
                                                <h3>{team.teamName}</h3>
                                                <p>Team ID: {team.id}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </>
                )}

                {/* CREATE NEW TEAM */}
                {activeSection === "create-team" && (
                    <div className="admin-create-team">
                        <h2>Create New Team</h2>

                        <p>
                            Enter a team name to add a new team to the system.
                        </p>

                        <form
                            className="admin-team-form"
                            onSubmit={handleCreateTeam}
                        >
                            <div className="filter-group">
                                <label htmlFor="new-team-name">
                                    Team Name
                                </label>

                                <input
                                    id="new-team-name"
                                    type="text"
                                    placeholder="Enter new team name"
                                    value={teamName}
                                    onChange={(event) =>
                                        setTeamName(event.target.value)
                                    }
                                    maxLength={100}
                                    required
                                />
                            </div>

                            {teamError && (
                                <p className="dashboard-error">
                                    {teamError}
                                </p>
                            )}

                            {teamMessage && (
                                <p className="dashboard-message">
                                    {teamMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="apply-filter-button"
                                disabled={creatingTeam}
                            >
                                {creatingTeam
                                    ? "Creating Team..."
                                    : "Create Team"}
                            </button>
                        </form>
                    </div>
                )}

            </section>
        </main>
    );
}

export default AdminDashboard;
