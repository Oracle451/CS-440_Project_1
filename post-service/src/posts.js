import express from "express";
import { db } from "./db.js";

const router = express.Router();

// ✦ All req.session.user checks become req.user checks
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM blogs ORDER BY date_created DESC");
    res.json({ posts: result.rows, user: req.user || null });
  } catch (err) {
    res.status(500).json({ error: "Error fetching posts." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Post not found." });
    res.json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Error fetching post." });
  }
});

router.post("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not signed in." });

  const { title, content } = req.body;
  const creatorUserId = parseInt(req.user.user_id, 10);
  if (isNaN(creatorUserId)) return res.status(500).json({ error: "Invalid user ID format" });

  try {
    await db.query(
      "INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, NOW())",
      [req.user.name, creatorUserId, title, content]
    );
    res.json({ message: "Post added." });
  } catch (err) {
    res.status(500).json({ error: "Error adding post." });
  }
});

router.put("/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not signed in." });

  const { id } = req.params;
  const { title, content } = req.body;
  const userIdAsInt = parseInt(req.user.user_id, 10);

  try {
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
    const post = result.rows[0];
    if (!post) return res.status(404).json({ error: "Post not found." });
    if (post.creator_user_id !== userIdAsInt) return res.status(403).json({ error: "Unauthorized." });

    await db.query("UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3", [title, content, id]);
    res.json({ message: "Post updated." });
  } catch (err) {
    res.status(500).json({ error: "Error updating post." });
  }
});

router.delete("/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not signed in." });

  const userIdAsInt = parseInt(req.user.user_id, 10);

  try {
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [req.params.id]);
    const post = result.rows[0];
    if (!post) return res.status(404).json({ error: "Post not found." });
    if (post.creator_user_id !== userIdAsInt) return res.status(403).json({ error: "Unauthorized." });

    await db.query("DELETE FROM blogs WHERE blog_id = $1", [req.params.id]);
    res.json({ message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ error: "Error deleting post." });
  }
});

router.post("/:id/like", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not signed in." });
  try {
    const result = await db.query(
      "UPDATE blogs SET likes = likes + 1 WHERE blog_id = $1 RETURNING likes", [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Post not found." });
    res.json({ likes: result.rows[0].likes });
  } catch (err) {
    res.status(500).json({ error: "Error liking post." });
  }
});

router.post("/:id/dislike", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not signed in." });
  try {
    const result = await db.query(
      "UPDATE blogs SET dislikes = dislikes + 1 WHERE blog_id = $1 RETURNING dislikes", [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Post not found." });
    res.json({ dislikes: result.rows[0].dislikes });
  } catch (err) {
    res.status(500).json({ error: "Error disliking post." });
  }
});

export default router;