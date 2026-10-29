
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function ManagerRegister() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [teamId, setTeamId] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Please log in with an administrator account first.");
            return;
        }

        try {
            const payload = JSON.parse(
                atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
            );

            if (payload.role !== "ADMIN") {
                setError("Only an administrator can create manager accounts.");
                return;
            }
        } catch {
            setError("Invalid login session. Please log in again.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/admin/managers",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        teamId: Number(teamId),
                    }),
                }
            );


            const result = await response.text();

            if (!response.ok) {
                let errorMessage = "Manager registration failed.";

                try {
                    const errorData = JSON.parse(result);
                    errorMessage =
                        errorData.message ||
                        errorData.error ||
                        errorData.detail ||
                        errorMessage;
                } catch {
                    errorMessage = result || errorMessage;
                }

                throw new Error(errorMessage);
            }


            setMessage("Manager account created successfully.");
            setName("");
            setEmail("");
            setPassword("");
            setTeamId("");
        } catch (err) {
            setError(err.message || "Unable to create manager account.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-card">
                <h1>Manager Registration</h1>
                <p className="login-subtitle">
                    Create a manager account for a team
                </p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="manager-name">Full name</label>
                    <input
                        id="manager-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter manager name"
                        required
                    />

                    <label htmlFor="manager-email">Email address</label>
                    <input
                        id="manager-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter manager email"
                        required
                    />

                    <label htmlFor="manager-password">Password</label>
                    <input
                        id="manager-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        minLength={8}
                        autoComplete="new-password"
                        required
                    />

                    <label htmlFor="manager-team">Team ID</label>
                    <input
                        id="manager-team"
                        type="number"
                        min="1"
                        value={teamId}
                        onChange={(e) => setTeamId(e.target.value)}
                        placeholder="Enter existing team ID"
                        required
                    />

                    {error && <p className="login-error">{error}</p>}
                    {message && <p>{message}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Create Manager"}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default ManagerRegister;
