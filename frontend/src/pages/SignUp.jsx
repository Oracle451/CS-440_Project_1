import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [form, setForm] = useState({ user_id: "", name: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/users/signup", form); // ← no withCredentials
      navigate("/signin");
    } catch (err) {
      setError("Error creating account.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h1>Sign Up</h1>
      {error && <p style={{ color: "darkred" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <h3>User ID</h3>
        <input type="text" required value={form.user_id}
          onChange={(e) => setForm({ ...form, user_id: e.target.value })} />
        <h3>Name</h3>
        <input type="text" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <h3>Password</h3>
        <input type="password" required value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit">Create Account</button>
      </form>
      <p style={{ textAlign: "center" }}>
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </div>
  );
}