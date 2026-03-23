// auth.js function to handle all user authentication and sign in/sign out functionality

// Import express and the database from db.js
import express from "express";
import { db } from "./db.js";
import eventBus from "./eventBus.js";

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

    // Publish the user
    eventBus.emit("user:signedup", { userId: user_id });

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

    // Publish the user signing in
    eventBus.emit("user:signedin", { userId: user_id });

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
  const userId = req.session.user?.user_id;
  req.session.destroy(() => {
    // Publish the user signing out
    eventBus.emit("user:signedout", { userId });
    res.json({ message: "Signed out" });
  });
});

// GET /api/account - get current user info
router.get("/account", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not signed in." });
  }
  res.json({ user: req.session.user });
});

// PUT /api/account - update name and/or password
router.put("/account", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not signed in." });
  }

  const { name, password } = req.body;
  const userId = req.session.user.user_id;

  if (!name && !password)
  {
    return res.status(400).json({ error: "Provide at least name or password to update." });
  }

  try {
    let query = "UPDATE users SET ";
    const values = [];
    let paramIndex = 1;

    if (name) {
      query += `name = $${paramIndex}`;
      values.push(name);
      paramIndex++;
    }
    if (password) {
      if (name) query += ", ";
      query += `password = $${paramIndex}`;
      values.push(password);
      paramIndex++;
    }

    query += ` WHERE user_id = $${paramIndex}`;
    values.push(userId);

    await db.query(query, values);

    // Update session
    if (name) req.session.user.name = name;

    // Publish the account update
    eventBus.emit("account:updated", { userId });

    res.json({ message: "Account updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating account." });
  }
});

// DELETE /api/account - delete own account + cascade posts
router.delete("/account", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not signed in." });
  }

  const userId = req.session.user.user_id;

  try {
    // Optional: delete all posts by this user first (or rely on ON DELETE CASCADE)
    await db.query("DELETE FROM blogs WHERE creator_user_id = $1", [userId]);

    // Delete user
    await db.query("DELETE FROM users WHERE user_id = $1", [userId]);

    // Destroy session
    req.session.destroy(() => {
      // Publish the account deletion
      eventBus.emit("account:deleted", { userId });
      res.json({ message: "Account deleted successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting account." });
  }
});

export default router;
