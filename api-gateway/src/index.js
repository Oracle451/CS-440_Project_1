import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Decode JWT and forward user info as a header
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      req.headers["x-user"] = JSON.stringify(jwt.verify(token, JWT_SECRET));
    } catch {}
  }
  next();
});

// Single proxy that routes based on the full path
app.use(createProxyMiddleware({
  changeOrigin: true,
  router: (req) => {
    if (req.path.startsWith("/api/users")) return "http://user-service:3001";
    if (req.path.startsWith("/api/posts")) return "http://post-service:3002";
  }
}));

app.listen(8080, () => console.log("API Gateway on port 8080"));