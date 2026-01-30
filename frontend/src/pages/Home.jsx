// Import react and axios
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

// Function for the homepage
export default function Home() {
    // Create use state variables for the posts, user, and new post variables
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [newPost, setNewPost] = useState({ title: "", content: "" });
    // useNavigate function lets us redirect the user
    const navigate = useNavigate();

    // When the page loads, fetchdata will run
    useEffect(() => {
        fetchData();
    }, []);

    // Function to get the post data
    const fetchData = async () => {
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
    };

    // Function to handle when the create post form is submitted
    const handleCreatePost = async (e) => {
        // Stop the page from reloading
        e.preventDefault();
        try {
            // Send a post request to add the post to the database
            await axios.post(
                "http://localhost:3001/api/posts",
                { title: newPost.title, content: newPost.content },
                { withCredentials: true }
            );

            // Clear input fields after post creation
            setNewPost({ title: "", content: "" });
            // Refetch posts list
            fetchData();

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
            // Refetch the posts list
            fetchData();
        // Throw an error if one occured
        } catch (err) {
            console.error(err);
        }
    };

    // Function to handle sign out action
    const handleSignOut = async () => {
        // Get request to sign out the user
        await axios.get("http://localhost:3001/api/signout", {
            withCredentials: true,
        });
        // Set the user variable to null
        setUser(null);
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
