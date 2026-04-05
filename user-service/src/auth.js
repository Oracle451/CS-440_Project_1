import express from "express";
import jwt from "jsonwebtoken";
import { db } from "./db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// POST /api/users/signup — unchanged from your original
router.post("/signup", async (req, res) => {
  const { user_id, password, name } = req.body;
  if (!user_id || !password || !name)
    return res.status(400).json({ error: "All fields are required." });

  try {
    const existing = await db.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "User ID already exists." });

    await db.query("INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)", [user_id, password, name]);
    res.json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error signing up." });
  }
});

// POST /api/users/signin — issues a JWT instead of creating a session
router.post("/signin", async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE user_id = $1 AND password = $2",
      [user_id, password]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials." });

    const user = result.rows[0];
    // ✦ NEW: sign a JWT with the user's info instead of req.session.user = ...
    const token = jwt.sign(
      { user_id: user.user_id, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({ token, user: { user_id: user.user_id, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: "Error signing in." });
  }
});

// GET /api/users/signout — no session to destroy, client just discards the token
router.get("/signout", (req, res) => {
  res.json({ message: "Signed out" });
});

// GET /api/users/account — user identity now comes from req.user (set by gateway)
router.get("/account", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT user_id, name FROM users WHERE user_id = $1",
      [req.user.user_id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Error fetching account." });
  }
});

// PUT /api/users/account — same logic, req.user replaces req.session.user
router.put("/account", async (req, res) => {
  const { name, password } = req.body;
  const userId = req.user.user_id;
  if (!name && !password)
    return res.status(400).json({ error: "Provide at least name or password." });

  try {
    let query = "UPDATE users SET ";
    const values = [];
    let i = 1;
    if (name)     { query += `name = $${i++}`;     values.push(name); }
    if (password) { if (name) query += ", "; query += `password = $${i++}`; values.push(password); }
    query += ` WHERE user_id = $${i}`;
    values.push(userId);

    await db.query(query, values);
    res.json({ message: "Account updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error updating account." });
  }
});

// DELETE /api/users/account
router.delete("/account", async (req, res) => {
  const userId = req.user.user_id;
  try {
    await db.query("DELETE FROM blogs WHERE creator_user_id = $1", [userId]);
    await db.query("DELETE FROM users WHERE user_id = $1", [userId]);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting account." });
  }
});

export default router;