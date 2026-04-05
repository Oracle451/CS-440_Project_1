import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const navigate = useNavigate();

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  useEffect(() => {
    axios.get(`http://localhost:8080/api/posts/${id}`, authHeaders())
      .then((res) => {
        setPost(res.data.post);
        setForm({ title: res.data.post.title, content: res.data.post.body });
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/posts/${id}`,
        { title: form.title, content: form.content },
        authHeaders()
      );
      navigate("/");
    } catch (err) {
      alert("Error updating post.");
    }
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>Modify Post</h1>
      <h2>Currently Editing: "{post.title}"</h2>
      <form onSubmit={handleSubmit}>
        <h3>Author</h3>
        <input type="text" value={post.creator_name} readOnly />
        <h3>Title</h3>
        <input type="text" required value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <h3>Content</h3>
        <textarea required value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}