import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function SignIn() {
  const [form, setForm] = useState({ user_id: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/users/signin", form);
      localStorage.setItem("token", res.data.token); // ← store the JWT
      navigate("/");
    } catch (err) {
      setError("Invalid credentials.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h1>Sign In</h1>
      {error && <p style={{ color: "darkred" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <h3>User ID</h3>
        <input type="text" required value={form.user_id}
          onChange={(e) => setForm({ ...form, user_id: e.target.value })} />
        <h3>Password</h3>
        <input type="password" required value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit">Sign In</button>
      </form>
      <p style={{ textAlign: "center" }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}