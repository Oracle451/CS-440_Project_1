import express from "express";
import jwt from "jsonwebtoken";
import { db } from "./db.js";

const router = express.Router();

// Use the JWT secret from environment variables, with a fallback for local development.
// Must match the secret used by the API Gateway so tokens can be verified consistently.
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// POST /api/users/signup - register a new user account.
// Validates that all fields are present, checks the user ID is not already taken,
// then inserts the new user into the database.
router.post("/signup", async (req, res) => {
  const { user_id, password, name } = req.body;
  
  // Reject the request early if any required field is missing
  if (!user_id || !password || !name)
    return res.status(400).json({ error: "All fields are required." });

  try 
  {
    // Check whether a user with this ID already exists before inserting
    const existing = await db.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "User ID already exists." });

    await db.query("INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)", [user_id, password, name]);
    res.json({ message: "User created successfully" });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error signing up." });
  }
});

// POST /api/users/signin - authenticate a user and return a JWT.
// Queries the database for a matching user_id and password combination.
// On success, signs a JWT containing the user's ID and display name,
// valid for 24 hours. The token is returned to the client for use in
// subsequent requests via the Authorization header.
router.post("/signin", async (req, res) => {
  const { user_id, password } = req.body;
  try 
  {
    const result = await db.query(
      "SELECT * FROM users WHERE user_id = $1 AND password = $2",
      [user_id, password]
    );

    // No matching user found, return a generic error to avoid revealing
    // whether the user ID or the password was wrong
    if (result.rows.length === 0)
    {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const user = result.rows[0];

    // Sign a JWT with the user's ID and name as the payload.
    // Downstream services read these fields from the x-user header
    // (set by the gateway) to identify the caller.
    const token = jwt.sign(
      { user_id: user.user_id, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({ token, user: { user_id: user.user_id, name: user.name } });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error signing in." });
  }
});

// GET /api/users/signout - sign out the current user.
// Because auth is JWT-based there is no server-side session to destroy.
// The client handles sign out by deleting the token from localStorage.
// This endpoint exists for consistency and to give the frontend a call to make.
router.get("/signout", (req, res) => {
  res.json({ message: "Signed out" });
});

// GET /api/users/account - return the current user's profile.
// req.user is populated by the gateway middleware via the x-user header,
// so no token parsing is needed here. Fetches fresh data from the database
// rather than relying solely on the JWT payload, which could be stale.
router.get("/account", async (req, res) => {
  try 
  {
    const result = await db.query(
      "SELECT user_id, name FROM users WHERE user_id = $1",
      [req.user.user_id]
    );
    res.json({ user: result.rows[0] });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error fetching account." });
  }
});

// PUT /api/users/account - update the current user's name and/or password.
// Builds the UPDATE query dynamically based on which fields were provided,
// so a user can change just their name, just their password, or both at once.
router.put("/account", async (req, res) => {
  const { name, password } = req.body;
  const userId = req.user.user_id;

  // Reject the request if neither field was provided, nothing to update
  if (!name && !password)
  {
    return res.status(400).json({ error: "Provide at least name or password." });
  }

  try 
  {
    // Build the SET clause dynamically using parameterized placeholders
    // to safely include only the fields the user actually wants to change
    let query = "UPDATE users SET ";

    const values = [];
    let i = 1;

    if (name) 
    { 
      query += `name = $${i++}`;
      values.push(name);
    }

    if (password) 
    { 
      if (name) query += ", ";
      query += `password = $${i++}`;
      values.push(password);
    }

    query += ` WHERE user_id = $${i}`;
    values.push(userId);

    await db.query(query, values);
    res.json({ message: "Account updated successfully" });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error updating account." });
  }
});

// DELETE /api/users/account - permanently delete the current user's account.
// Removes all blog posts created by this user first, then removes the user
// record itself. This replicates ON DELETE CASCADE behaviour manually since
// the posts table lives in a separate database that this service cannot
// reference with a foreign key constraint.
router.delete("/account", async (req, res) => {
  const userId = req.user.user_id;
  try 
  {
    // Delete the user's posts first to avoid orphaned records in posts-db
    await db.query("DELETE FROM blogs WHERE creator_user_id = $1", [userId]);
    await db.query("DELETE FROM users WHERE user_id = $1", [userId]);
    res.json({ message: "Account deleted successfully" });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error deleting account." });
  }
});

export default router;