import express from "express";
import bodyParser from "body-parser";
import postsRouter from "./posts.js";

const app = express();
app.use(bodyParser.json());

// Same pattern: gateway forwards the decoded user as a header
app.use((req, res, next) => {
  const userHeader = req.headers["x-user"];
  if (userHeader) {
    try { req.user = JSON.parse(userHeader); } catch {}
  }
  next();
});

app.use("/api/posts", postsRouter);

app.listen(3002, () => console.log("Post service on port 3002"));