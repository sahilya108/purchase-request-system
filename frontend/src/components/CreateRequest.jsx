
import { useState } from "react";

function CreateRequest({ onCreated }) {
  const [form, setForm] = useState({
    itemName: "",
    description: "",
    quantity: 1,
    amount: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          amount: Number(form.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create request");
      }

      setSuccess("Purchase request submitted successfully!");
      setForm({
        itemName: "",
        description: "",
        quantity: 1,
        amount: "",
        reason: "",
      });

      if (onCreated) onCreated(data);
    } catch (err) {
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="create-request-card">
      <h2>Create Purchase Request</h2>

      <form className="request-form" onSubmit={handleSubmit}>
        <label htmlFor="itemName">Item name</label>
        <input
          id="itemName"
          name="itemName"
          value={form.itemName}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <div className="request-form-row">
          <div>
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="amount">Total amount (₹)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label htmlFor="reason">Reason for request</label>
        <textarea
          id="reason"
          name="reason"
          value={form.reason}
          onChange={handleChange}
          required
        />

        {error && <p className="dashboard-error">{error}</p>}
        {success && <p className="request-success">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </section>
  );
}

export default CreateRequest;
