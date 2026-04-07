import express from "express";
import bodyParser from "body-parser";
import postsRouter from "./posts.js";

const app = express();

// Parse incoming JSON request bodies so route handlers can access req.body
app.use(bodyParser.json());

// User identity middleware: runs on every request before reaching any route handler.
// The API Gateway verifies the JWT and forwards the decoded user payload as the
// x-user header, so this service never needs to handle JWT verification itself.
app.use((req, res, next) => {
  const userHeader = req.headers["x-user"];

  if (userHeader) 
  {
    try 
    { 
      // Attach the parsed user object to req so route handlers can access
      // the caller's identity via req.user (req.user.user_id)
      req.user = JSON.parse(userHeader); 
    } 
    catch 
    {
      // Reaching this point implies a malformed header. Leave req.user undefined so the request is
      // treated as unauthenticated by the route handlers below
    }
  }
  next();
});

// Mount the posts router, handles all blog post CRUD, likes, and dislikes
app.use("/api/posts", postsRouter);

app.listen(3002, () => console.log("Post service on port 3002"));