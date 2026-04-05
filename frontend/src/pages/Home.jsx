import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const navigate = useNavigate();

  // ← helper that adds the JWT to every request
  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:8080/api/users/account", authHeaders());
      setUser(res.data.user);
    } catch {
      localStorage.removeItem("token"); // token expired or invalid
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/posts");
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/posts",
        { title: newPost.title, content: newPost.content },
        authHeaders()
      );
      setNewPost({ title: "", content: "" });
      fetchData();
    } catch (err) {
      alert("Failed to add post. Make sure you're signed in.");
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/like`, {}, authHeaders());
      setPosts((prev) => prev.map((p) =>
        p.blog_id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
      ));
    } catch (err) {
      alert("Failed to like post.");
    }
  };

  const handleDislike = async (postId) => {
    if (!user) return;
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/dislike`, {}, authHeaders());
      setPosts((prev) => prev.map((p) =>
        p.blog_id === postId ? { ...p, dislikes: (p.dislikes || 0) + 1 } : p
      ));
    } catch (err) {
      alert("Failed to dislike post.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/posts/${id}`, authHeaders());
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    await axios.get("http://localhost:8080/api/users/signout", authHeaders());
    localStorage.removeItem("token"); // ← clear the JWT
    setUser(null);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>Mini Blog</h1>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        {user ? (
          <>
            Welcome, <strong>{user.name}</strong> |{" "}
            <button type="button" onClick={() => navigate("/account")}>Account</button> |
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <><Link to="/signin">Sign In</Link> | <Link to="/signup">Sign Up</Link></>
        )}
      </div>

      {user ? (
        <form onSubmit={handleCreatePost} className="new-post-form">
          <h2>Create Post</h2>
          <input type="text" placeholder="Title" required value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
          <textarea placeholder="Write your post..." required value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} />
          <button type="submit">Add Post</button>
        </form>
      ) : (
        <div className="new-post-form" style={{ textAlign: "center" }}>
          <p>Sign in to create new posts.</p>
          <Link to="/signin"><button>Sign in</button></Link>
        </div>
      )}

      <h2>All Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.blog_id} style={{ marginBottom: "20px" }}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
            <p><em>By {post.creator_name} on {new Date(post.date_created).toLocaleString()}</em></p>
            <div style={{ marginTop: "12px", display: "flex", gap: "16px", alignItems: "center" }}>
              <button onClick={() => handleLike(post.blog_id)} disabled={!user}
                style={{ backgroundColor: "#e0f2fe", border: "1px solid #3b82f6", color: "#1d4ed8", padding: "6px 12px", borderRadius: "6px", cursor: user ? "pointer" : "not-allowed" }}>
                👍 {post.likes || 0}
              </button>
              <button onClick={() => handleDislike(post.blog_id)} disabled={!user}
                style={{ backgroundColor: "#fee2e2", border: "1px solid #ef4444", color: "#b91c1c", padding: "6px 12px", borderRadius: "6px", cursor: user ? "pointer" : "not-allowed" }}>
                👎 {post.dislikes || 0}
              </button>
            </div>
            <p>-</p>
            {user && user.user_id === post.creator_user_id && (
              <>
                <button onClick={() => navigate(`/edit/${post.blog_id}`)}>Edit</button>{" "}
                <button onClick={() => handleDelete(post.blog_id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}