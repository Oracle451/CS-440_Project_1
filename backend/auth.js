// auth.js function to handle all user authentication and sign in/sign out functionality

// Import express and the database from db.js
import express from "express";
import { db } from "./db.js";

const router = express.Router();

// Post request for the signup endpoint
router.post("/signup", async (req, res) => {
    const { user_id, password, name } = req.body;
  
    // Check if all the fields for the signup form are filled in
    if (!user_id || !password || !name)
    {
        // If not all fields are filled out then return with an error code
        return res.status(400).json({ error: "All fields are required." });
    }

    // Try to query the database for users with that id
    try {
        const existing = await db.query("SELECT * FROM users WHERE user_id = $1", [user_id]);

        // If 1 or more results exist then return because that user already exists
        if (existing.rows.length > 0)
        {
            return res.status(400).json({ error: "User ID already exists." });
        }

        // If no users with that id exist then insert the new user into the database
        await db.query("INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)", [user_id, password, name]);
        // Deliver a message saying the user was created successfully
        res.json({ message: "User created successfully" });

    } 
    // If there was an error querying the databse, print an error here
    catch (err)
    {
        console.error(err);
        res.status(500).json({ error: "Error signing up." });
    }
});

// Post request for the signin endpoint
router.post("/signin", async (req, res) => {
    // Get the user id and password from the request body
    const { user_id, password } = req.body;

    // Try to query the database for a user with that information
    try {
        const result = await db.query("SELECT * FROM users WHERE user_id = $1 AND password = $2", [user_id, password]);
        // Check if no users match those credentials
        if (result.rows.length === 0)
        {
            // If so then deliver an error message to the user
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // If the user matches the returned result then complete their sign in
        req.session.user = result.rows[0];
        res.json({ message: "Signed in successfully", user: req.session.user });
    }
    // If there was an error querying the database then deliver an error
    catch (err)
    {
        res.status(500).json({ error: "Error signing in." });
    }
});

// Get request for the signout endpoint
router.get("/signout", (req, res) => {
    // Destroy the session and deliver a message confirming the signout
    req.session.destroy(() => res.json({ message: "Signed out" }));
});

export default router;
