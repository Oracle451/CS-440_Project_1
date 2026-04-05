import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Decode the JWT (if present) and forward user info as a plain header
const attachUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      req.headers["x-user"] = JSON.stringify(jwt.verify(token, JWT_SECRET));
    } catch {
      // Invalid token — services will treat the request as unauthenticated
    }
  }
  next();
};

app.use(attachUser);

// ✦ Public auth routes — no auth needed
app.use("/api/users/signup", createProxyMiddleware({ target: "http://user-service:3001", changeOrigin: true }));
app.use("/api/users/signin", createProxyMiddleware({ target: "http://user-service:3001", changeOrigin: true }));
app.use("/api/users/signout", createProxyMiddleware({ target: "http://user-service:3001", changeOrigin: true }));

// ✦ Protected user routes
app.use("/api/users", createProxyMiddleware({ target: "http://user-service:3001", changeOrigin: true }));

// ✦ Post routes
app.use("/api/posts", createProxyMiddleware({ target: "http://post-service:3002", changeOrigin: true }));

app.listen(8080, () => console.log("API Gateway on port 8080"));