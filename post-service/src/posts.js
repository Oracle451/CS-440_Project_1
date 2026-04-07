import express from "express";
import { db } from "./db.js";

const router = express.Router();

// GET /api/posts - fetch all blog posts ordered by newest first.
// Also returns the current user from req.user (set by the gateway middleware)
// so the frontend knows whether to show edit/delete buttons.
router.get("/", async (req, res) => {
  try 
  {
    const result = await db.query("SELECT * FROM blogs ORDER BY date_created DESC");
    res.json({ posts: result.rows, user: req.user || null });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error fetching posts." });
  }
});

// GET /api/posts/:id - fetch a single post by its ID.
// Returns 404 if no post with that ID exists.
router.get("/:id", async (req, res) => {
  try 
  {
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Post not found." });
    res.json({ post: result.rows[0] });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error fetching post." });
  }
});

// POST /api/posts - create a new blog post.
// Requires the user to be authenticated (req.user set by gateway middleware).
// The creator's name and ID are taken from req.user rather than the request
// body to prevent a user from creating posts under someone else's identity.
router.post("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not signed in." });

  const { title, content } = req.body;

  // Convert user_id to an integer. The database column is numeric,
  // and the JWT payload carries it as a string.
  const creatorUserId = parseInt(req.user.user_id, 10);
  if (isNaN(creatorUserId)) return res.status(500).json({ error: "Invalid user ID format" });

  try 
  {
    await db.query(
      "INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, NOW())",
      [req.user.name, creatorUserId, title, content]
    );
    res.json({ message: "Post added." });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error adding post." });
  }
});

// PUT /api/posts/:id - update the title and body of an existing post.
// Requires authentication and ownership, users can only edit their own posts.
// Fetches the post first to compare creator_user_id before allowing the update.
router.put("/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not signed in." });

  const { id } = req.params;
  const { title, content } = req.body;
  const userIdAsInt = parseInt(req.user.user_id, 10);

  try 
  {
    // Fetch the post to verify it exists and check ownership
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
    const post = result.rows[0];

    if (!post) return res.status(404).json({ error: "Post not found." });
    
    // Reject the request if the logged-in user did not create this post
    if (post.creator_user_id !== userIdAsInt) return res.status(403).json({ error: "Unauthorized." });

    await db.query("UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3", [title, content, id]);
    res.json({ message: "Post updated." });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error updating post." });
  }
});

// DELETE /api/posts/:id - delete a post by its ID.
// Requires authentication and ownership. Users can only delete their own posts.
// Fetches the post first to confirm it exists and verify the caller is its creator.
router.delete("/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not signed in." });

  const userIdAsInt = parseInt(req.user.user_id, 10);

  try 
  {
    // Fetch the post to verify it exists and check ownership
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [req.params.id]);
    const post = result.rows[0];

    if (!post) return res.status(404).json({ error: "Post not found." });
    
    // Reject the request if the logged in user did not create this post
    if (post.creator_user_id !== userIdAsInt) return res.status(403).json({ error: "Unauthorized." });

    await db.query("DELETE FROM blogs WHERE blog_id = $1", [req.params.id]);
    res.json({ message: "Post deleted." });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error deleting post." });
  }
});

// POST /api/posts/:id/like - increment the like count on a post by 1.
// Requires authentication to prevent unauthenticated users from liking posts.
// Uses RETURNING to send back the updated like count in the response.
router.post("/:id/like", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not signed in." });
  try 
  {
    const result = await db.query(
      "UPDATE blogs SET likes = likes + 1 WHERE blog_id = $1 RETURNING likes", [req.params.id]
    );

    // rowCount of 0 means no post matched that ID
    if (result.rowCount === 0) return res.status(404).json({ error: "Post not found." });
    res.json({ likes: result.rows[0].likes });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error liking post." });
  }
});

// POST /api/posts/:id/dislike - increment the dislike count on a post by 1.
// Mirrors the like route. Requires authentication and returns the updated count.
router.post("/:id/dislike", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not signed in." });
  try 
  {
    const result = await db.query(
      "UPDATE blogs SET dislikes = dislikes + 1 WHERE blog_id = $1 RETURNING dislikes", [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Post not found." });
    res.json({ dislikes: result.rows[0].dislikes });
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Error disliking post." });
  }
});

export default router;