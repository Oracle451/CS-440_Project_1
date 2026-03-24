// Import react and axios
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Function for the signin page
export default function SignIn() {
    // Create a usestate variable for the form and an error
    const [form, setForm] = useState({ user_id: "", password: "" });
    const [error, setError] = useState(null);
    // useNavigate lets us redirect the user
    const navigate = useNavigate();

    // Function to handle the submitting of the form
    const handleSubmit = async (e) => {
        // Stop the page from reloading
        e.preventDefault();
        try {
            // Post request to check the users credentials
            await axios.post("http://localhost:3001/api/signin", form, {
                withCredentials: true,
            });
            // Return to root
            navigate("/");

        // If an error occured then throw an error
        } catch (err) {
            setError("Invalid credentials.");
        }
    };

    // The UI of the signin page
    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
            <h1>Sign In</h1>
            {error && <p style={{ color: "darkred" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <h3>User ID</h3>
                <input
                type="text"
                name="user_id"
                required
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                />
                <h3>Password</h3>
                <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="submit">Sign In</button>
            </form>

            <p style={{ textAlign: "center" }}>
                Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
        </div>
    );
}
