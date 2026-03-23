import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import eventBus from "../eventBus";

export default function Account() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/account", {
          withCredentials: true,
        });
        setUser(res.data.user);
        setForm((prev) => ({ ...prev, name: res.data.user.name }));
      } catch (err) {
        console.error(err);
        navigate("/signin");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const payload = {};
    if (form.name && form.name !== user.name) payload.name = form.name;
    if (form.password) payload.password = form.password;

    if (Object.keys(payload).length === 0) {
      setError("No changes to save.");
      return;
    }

    try {
      await axios.put("http://localhost:3001/api/account", payload, {
        withCredentials: true,
      });

      // Publish the account update event with relevant details
      eventBus.publish("account:updated", { name: form.name });

      setMessage("Account updated successfully!");
      setForm({ ...form, password: "", confirmPassword: "" });
      setUser((prev) => ({ ...prev, name: form.name }));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update account.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    try {
      await axios.delete("http://localhost:3001/api/account", {
        withCredentials: true,
      });

      // Publish the account deletion event with relevant details
      eventBus.publish("account:deleted");

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete account.");
    }
  };

  if (!user) return <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1>Your Account</h1>

      {message && <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>}
      {error && <p style={{ color: "darkred" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <h3>User ID (cannot change)</h3>
        <input type="text" value={user.user_id} readOnly />

        <h3>Name</h3>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <h3>New Password (leave blank to keep current)</h3>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Enter new password"
        />

        <h3>Confirm New Password</h3>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          placeholder="Confirm new password"
        />

        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => navigate("/")}>
                Done / Cancel
            </button>
        </div>
      </form>

      <div style={{ marginTop: "40px", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
        <button
          onClick={handleDeleteAccount}
          style={{
            backgroundColor: "#dc2626",
            color: "white",
            padding: "12px 20px",
            fontSize: "16px",
          }}
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}
