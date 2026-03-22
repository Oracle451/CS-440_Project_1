import express from "express";
import { authService } from "../services/authService.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { user_id, password, name } = req.body;
  if (!user_id || !password || !name)
    return res.status(400).json({ error: "All fields are required." });
  try {
    await authService.signup(user_id, password, name);
    res.json({ message: "User created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const user = await authService.signin(req.body.user_id, req.body.password);
    req.session.user = user;
    res.json({ message: "Signed in successfully", user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.get("/signout", (req, res) => {
  req.session.destroy(() => res.json({ message: "Signed out" }));
});

router.get("/account", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not signed in." });
  res.json({ user: req.session.user });
});

router.put("/account", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not signed in." });
  try {
    const updated = await authService.updateAccount(req.session.user.user_id, req.body);
    if (updated.name) req.session.user.name = updated.name;
    res.json({ message: "Account updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/account", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not signed in." });
  try {
    await authService.deleteAccount(req.session.user.user_id);
    req.session.destroy(() => res.json({ message: "Account deleted successfully" }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;