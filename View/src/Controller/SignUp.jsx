// Import react and axios
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Create a signup function
export default function SignUp() {
    // Create a state variable for the form fields
    const [form, setForm] = useState({ user_id: "", name: "", password: "" });
    // Create state variable to hold any returned errors
    const [error, setError] = useState(null);
    // useNavigate hook gives us a function that can redirect users to other pages
    const navigate = useNavigate();

    // Function to run when user submits the signup form
    const handleSubmit = async (e) => {
        // Prevent the browser from refreshing the page
        e.preventDefault();
        try {
            // Send a post request to the express backend to create a new account
            await axios.post("http://localhost:3001/api/signup", form);
            // If the request succeeds then navigate to the sign in page
            navigate("/signin");
        } catch (err) {
            // If an error occured then throw an error
            setError("Error creating account.");
        }
    };

    // Return the JSX to define what the page looks like
    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
            <h1>Sign Up</h1>
            {/* If an error exists then display it in red*/}
            {error && <p style={{ color: "darkred" }}>{error}</p>}
            {/* Form to collect new user info */}
            <form onSubmit={handleSubmit}>
                <h3>User ID</h3>
                <input
                type="text"
                name="user_id"
                required
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                />

                <h3>Name</h3>
                <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <h3>Password</h3>
                <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="submit">Create Account</button>
            </form>

            {/* Link to the sign in page */}
            <p style={{ textAlign: "center" }}>
                Already have an account? <Link to="/signin">Sign in</Link>
            </p>
        </div>
    );
}
