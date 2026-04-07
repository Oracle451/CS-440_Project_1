import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();

// Use the JWT secret from environment variables, with a fallback for local development
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Allow requests from the React frontend, with credentials enabled so
// authorization headers are included in cross-origin requests
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// JWT decoding middleware: Runs on every request before proxying
// If a valid token is present, the decoded user payload is attached as the
// x-user header so downstream services can identify the caller without
// needing to verify the JWT themselves
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) 
  {
    try 
    {
      // Verify the token signature and decode the payload
      req.headers["x-user"] = JSON.stringify(jwt.verify(token, JWT_SECRET));
    } 
    catch 
    {
      // Invalid or expired token. Silently skip so the request continues
      // as unauthenticated. Individual services enforce their own auth checks.
    }
  }
  next();
});

// Proxy middleware: Routes each request to the correct microservice
// based on the URL path. Using a single proxy with a router function
// preserves the full request path (/api/posts/5 stays intact),
// which avoids the path stripping issue that occurs with multiple app.use() mounts.
app.use(createProxyMiddleware({
  changeOrigin: true,
  router: (req) => {
    // Route all user related requests to the User Service
    if (req.path.startsWith("/api/users")) return "http://user-service:3001";
    // Route all post-related requests to the Post Service
    if (req.path.startsWith("/api/posts")) return "http://post-service:3002";
  }
}));

app.listen(8080, () => console.log("API Gateway on port 8080"));