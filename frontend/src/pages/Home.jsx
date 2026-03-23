// Import react and axios
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import eventBus from "../eventBus";

// Function for the homepage
export default function Home() {
  // Create use state variables for the posts, user, and new post variables
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  // useNavigate function lets us redirect the user
  const navigate = useNavigate();

  // Function to get the post data
  const fetchData = useCallback(async () => {
    try {
      // Get request to the backend
      const res = await axios.get("http://localhost:3001/api/posts", {
        withCredentials: true,
      });
      // Populate the posts and user variables
      setPosts(res.data.posts);
      setUser(res.data.user);
    
    // Throw an error if one occured
    } catch (err) {
      console.error(err);
    }
  }, []);

  // When the page loads, fetchdata will run
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to events for user sign in and sign out
  useEffect(() => {
    const unsubSignedIn = eventBus.subscribe("user:signedIn", ({ user }) => {
      setUser(user);
    });

    const unsubSignedOut = eventBus.subscribe("user:signedOut", () => {
      setUser(null);
    });

    return () => {
      unsubSignedIn();
      unsubSignedOut();
    };
  }, []);

  // Subscribe to SSE events for real time updates to posts
  useEffect(() => {
    const source = new EventSource("http://localhost:3001/api/sse", {
      withCredentials: true,
    });

    // A post was created, add it to the top of the list
    source.addEventListener("post:created", (e) => {
      const { post } = JSON.parse(e.data);
      setPosts((prev) => {
        // Avoid duplicate if this client was the publisher
        if (prev.some((p) => p.blog_id === post.blog_id)) return prev;
        return [post, ...prev];
      });
    });

    // A post was updated, patch it in place
    source.addEventListener("post:updated", (e) => {
      const { postId, title } = JSON.parse(e.data);
      setPosts((prev) =>
        prev.map((p) =>
          String(p.blog_id) === String(postId) ? { ...p, title } : p
        )
      );
    });

    // A post was deleted, remove it
    source.addEventListener("post:deleted", (e) => {
      const { postId } = JSON.parse(e.data);
      setPosts((prev) =>
        prev.filter((p) => String(p.blog_id) !== String(postId))
      );
    });

    // Like and dislike counts updated
    source.addEventListener("post:liked", (e) => {
      const { postId, likes } = JSON.parse(e.data);
      setPosts((prev) =>
        prev.map((p) =>
          String(p.blog_id) === String(postId) ? { ...p, likes } : p
        )
      );
    });

    source.addEventListener("post:disliked", (e) => {
      const { postId, dislikes } = JSON.parse(e.data);
      setPosts((prev) =>
        prev.map((p) =>
          String(p.blog_id) === String(postId) ? { ...p, dislikes } : p
        )
      );
    });

    source.onerror = (err) => {
      console.error("[SSE] connection error", err);
    };

    return () => source.close();
  }, []);

  // Function to handle when the create post form is submitted
  const handleCreatePost = async (e) => {
    // Stop the page from reloading
    e.preventDefault();
    try {
      // Send a post request to add the post to the database
      const res = await axios.post(
        "http://localhost:3001/api/posts",
        { title: newPost.title, content: newPost.content },
        { withCredentials: true }
      );

      // Clear input fields after post creation
      setNewPost({ title: "", content: "" });

      eventBus.publish("post:created", { post: res.data.post });
    // Throw an error if one occured
    } catch (err) {
      console.error(err);
      alert("Failed to add post. Make sure you're signed in.");
    }
  };

  // Function to handle deleting a post
  const handleDelete = async (id) => {
    // Ask the user to confirm deletion
    if (!window.confirm("Delete this post?")) return;
    try {
      // Send a delete request to the backend
      await axios.delete(`http://localhost:3001/api/posts/${id}`, {
        withCredentials: true,
      });
      // Remove from list and publish the post deletion
      eventBus.publish("post:deleted", { postId: id });
    // Throw an error if one occured
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;

    try {
      await axios.post(
      `http://localhost:3001/api/posts/${postId}/like`,
      {},
      { withCredentials: true }
      );

    } catch (err) {
      console.error(err);
      alert("Failed to like post.");
    }
  };

  const handleDislike = async (postId) => {
    if (!user) return;

    try {
      await axios.post(
      `http://localhost:3001/api/posts/${postId}/dislike`,
      {},
      { withCredentials: true }
      );
    } catch (err) {
      console.error(err);
      alert("Failed to dislike post.");
    }
  };

  // Function to handle sign out action
  const handleSignOut = async () => {
    // Get request to sign out the user
    await axios.get("http://localhost:3001/api/signout", {
      withCredentials: true,
    });
    // PUBLISH so any subscriber can clear user state
    eventBus.publish("user:signedOut");
  };

  // Home page content
  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      {/* Title */}
      <h1>Mini Blog</h1>

      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        {/* Welcome the user or ask them to sign in */}
        {user ? (
        <>
          Welcome, <strong>{user.name}</strong> |{" "}
          <button type="button" onClick={() => navigate("/account")}>
            Account
          </button>
          |
          <button onClick={handleSignOut}>Sign Out</button>
        </>
        ) : (
        <>
        <Link to="/signin">Sign In</Link> | <Link to="/signup">Sign Up</Link>
        </>
        )}
      </div>

      {/* Let the user create a new post or ask them to sign in depending if they are signed in already */}
      {user ? (
        <form onSubmit={handleCreatePost} className="new-post-form">
          <h2>Create Post</h2>
          <input
            type="text"
            name="title"
            placeholder="Title"
            required
            value={newPost.title}
            onChange={(e) => 
              setNewPost({ ...newPost, title: e.target.value })
            }
          />
          <textarea
            name="content"
            placeholder="Write your post..."
            required
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
          />
          <button type="submit">Add Post</button>
        </form>
      ) : (
        <div className="new-post-form" style={{ textAlign: "center" }}>
          <p>Sign in to create new posts.</p>
          <Link to="/signin">
            <button>Sign in</button>
          </Link>
        </div>
      )}

      {/* Display a list of all posts in the database */}
      <h2>All Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.blog_id} style={{ marginBottom: "20px" }}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
            <p>
            <em>
              By {post.creator_name} on{" "}
              {new Date(post.date_created).toLocaleString()}
            </em>
            </p>

            {/* Like / Dislike buttons + counts */}
            <div style={{ marginTop: "12px", display: "flex", gap: "16px", alignItems: "center" }}>
              <button
              onClick={() => handleLike(post.blog_id)}
              disabled={!user}
              style={{
                backgroundColor: "#e0f2fe",
                border: "1px solid #3b82f6",
                color: "#1d4ed8",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: user ? "pointer" : "not-allowed",
              }}
              >
              👍 {post.likes || 0}
              </button>

              <button
              onClick={() => handleDislike(post.blog_id)}
              disabled={!user}
              style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #ef4444",
                color: "#b91c1c",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: user ? "pointer" : "not-allowed",
              }}
              >
              👎 {post.dislikes || 0}
              </button>
            </div>

            <p>-</p>

            {user && user.user_id === post.creator_user_id && (
            <>
              <button onClick={() => navigate(`/edit/${post.blog_id}`)}>
                Edit
              </button>{" "}
              <button onClick={() => handleDelete(post.blog_id)}>
                Delete
              </button>
            </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
