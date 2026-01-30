// Import all needed packages
import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import cors from "cors";
import postsRouter from "./posts.js";
import authRouter from "./auth.js";

const app = express();
// Set the port to host the backend on
const port = 3001;

// Setup Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(session({
  secret: "simpleblogsecret",
  resave: false,
  saveUninitialized: true
}));

// Create routes for the post modifications and user management
app.use("/api/posts", postsRouter);
app.use("/api", authRouter);

// Start the server and log a message
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
