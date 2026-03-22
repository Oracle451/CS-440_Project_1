import express from "express";
import { postService } from "../services/postService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const posts = await postService.getAll();
    res.json({ posts, user: req.session.user || null });
  } catch (err) {
    res.status(500).json({ error: "Error fetching posts." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await postService.getById(req.params.id);
    res.json({ post });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not signed in." });
  try {
    await postService.create(req.session.user, req.body.title, req.body.content);
    res.json({ message: "Post added." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not signed in." });
  try {
    await postService.update(req.params.id, req.session.user, req.body.title, req.body.content);
    res.json({ message: "Post updated." });
  } catch (err) {
    const status = err.message === "Unauthorized." ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not signed in." });
  try {
    await postService.delete(req.params.id, req.session.user);
    res.json({ message: "Post deleted." });
  } catch (err) {
    const status = err.message === "Unauthorized." ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
});

router.post("/:id/like", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not signed in." });
  try {
    const likes = await postService.like(req.params.id);
    res.json({ message: "Liked", likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/dislike", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not signed in." });
  try {
    const dislikes = await postService.dislike(req.params.id);
    res.json({ message: "Disliked", dislikes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;