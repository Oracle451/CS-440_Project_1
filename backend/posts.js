// Import express and the database from db.js
import express from "express";
import { db } from "./db.js";

const router = express.Router();

// Get request for root endpoint
router.get("/", async (req, res) => {
    // Try to query the database for all blog posts
    try {
        // Query the database for all posts, package them up, and send them
        const result = await db.query("SELECT * FROM blogs ORDER BY date_created DESC");
        res.json({ posts: result.rows, user: req.session.user || null });
    } 
    // If there was a problem querying the database then print an error
    catch (err)
    {
        res.status(500).json({ error: "Error fetching posts." });
    }
});

// Get request for the edit post route
router.get("/:id", async (req, res) => {
    // Get the id from the request parameters
    const { id } = req.params;

    // Attempt to query the database for the post with that id
    try {
        const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
        // If no results were returned then throw an error
        if (result.rows.length === 0)
        {
            return res.status(404).json({ error: "Post not found." });
        }
        // Send the post as a response
        res.json({ post: result.rows[0] });
    } 
    // If there was an error querying the database then throw an error
    catch (err)
    {
        res.status(500).json({ error: "Error fetching post." });
    }
});

// Post request to create a blog post
router.post("/", async (req, res) => {
    // if the user is not signed in then throw an error
    if (!req.session.user)
    {
        return res.status(401).json({ error: "Not signed in." });
    }

    // Get the title, content, and user from the request and session info
    const { title, content } = req.body;
    const user = req.session.user;

    // Insert the post into the database
    try {
        await db.query(
        "INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, NOW())",
        [user.name, user.user_id, title, content]
        );
        // Send a message confirming success
        res.json({ message: "Post added." });
    } 
    // If there was a problem querying the database then throw an error
    catch (err) 
    {
        res.status(500).json({ error: "Error adding post." });
    }
});

// Put request to update a blog post
router.put("/:id", async (req, res) => {
    // If the user is not logged in then throw an error
    if (!req.session.user)
    {
        return res.status(401).json({ error: "Not signed in." });
    }

    // Get the post id, content, title, and user from the request and session
    const { id } = req.params;
    const { title, content } = req.body;
    const user = req.session.user;

    // Try to query the database for the blog post being edited
    try {
        const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
        const post = result.rows[0];

        // If no post was found then throw an error
        if (!post) 
        {
            return res.status(404).json({ error: "Post not found." });
        }

        // If the user did not create the post then throw an error
        if (post.creator_user_id !== user.user_id)
        {
            return res.status(403).json({ error: "Unauthorized." });
        }

        // Query the database to update the blog post
        await db.query("UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3", [title, content, id]);
        res.json({ message: "Post updated." });

    // If there was an error updating the post then throw an error
    } catch (err) {
        res.status(500).json({ error: "Error updating post." });
    }
});

// Delete request to delete a selected post
router.delete("/:id", async (req, res) => {
    // If the user is not logged in then throw an error
    if (!req.session.user)
    {
        return res.status(401).json({ error: "Not signed in." });
    }

    // Get the post id and user from the request and session
    const { id } = req.params;
    const user = req.session.user;

    // Try to query the database for the selected post
    try {
        const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
        const post = result.rows[0];
        // If the post does not exist then throw an error
        if (!post) 
        {
            return res.status(404).json({ error: "Post not found." });
        }

        // If the user did not create the post then throw an error
        if (post.creator_user_id !== user.user_id)
        {
            return res.status(403).json({ error: "Unauthorized." });
        }

        // Query the database to delete the post
        await db.query("DELETE FROM blogs WHERE blog_id = $1", [id]);
        res.json({ message: "Post deleted." });

    // If there was an error deleting the post then throw an error
    } catch (err) {
        res.status(500).json({ error: "Error deleting post." });
    }
});

export default router;
