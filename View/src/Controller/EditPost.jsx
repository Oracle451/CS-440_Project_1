// Import react and axios
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

// Create the edit post function
export default function EditPost() {
    // Get the user id from the URL
    const { id } = useParams();
    // Create a use state variable to hold the post and form info
    const [post, setPost] = useState(null);
    const [form, setForm] = useState({ title: "", content: "" });
    // useNavigate function to let us redirect the user
    const navigate = useNavigate();

    // Function to get the existing post data from the database
    useEffect(() => {
        axios
        // Send a get request to get the post to edit
        .get(`http://localhost:3001/api/posts/${id}`, { withCredentials: true })
        .then((res) => {
            // Save the post data to the state variable
            setPost(res.data.post);
            // Fill in the form with the post content
            setForm({
            title: res.data.post.title,
            content: res.data.post.body,
            });
        })
        // Throw an error if one occured
        .catch((err) => console.error(err));
    }, [id]);

    // Function to submit the form when the user clicks save
    const handleSubmit = async (e) => {
        // Stop the browser from reloading
        e.preventDefault();
        try {
            // Send a put request to update the database
            await axios.put(
                `http://localhost:3001/api/posts/${id}`,
                { title: form.title, content: form.content },
                { withCredentials: true }
            );
            // Go back to the root
            navigate("/");
        // Throw an error if one occured
        } catch (err) {
            console.error(err);
            alert("Error updating post.");
        }
    };

    // While waiting for the, post show a loading message
    if (!post) return <p>Loading...</p>;

    // UI for the edit post page
    return (
        <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
            <h1>Modify Post</h1>
            <h2>Currently Editing: "{post.title}"</h2>

            <form onSubmit={handleSubmit}>
                <h3>Author</h3>
                <input type="text" value={post.creator_name} readOnly />
                <h3>Title</h3>
                <input
                    type="text"
                    name="title"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                
                <h3>Content</h3>
                <textarea
                    name="content"
                    required
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
                <button type="submit">Save</button>
            </form>
        </div>
    );
}
