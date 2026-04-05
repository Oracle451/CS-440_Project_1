import express from "express";
import bodyParser from "body-parser";
import authRouter from "./auth.js";

const app = express();
app.use(bodyParser.json());

// Middleware to attach req.user from the header the gateway forwards
app.use((req, res, next) => {
  const userHeader = req.headers["x-user"];
  if (userHeader) {
    try { req.user = JSON.parse(userHeader); } catch {}
  }
  next();
});

app.use("/api/users", authRouter);

app.listen(3001, () => console.log("User service on port 3001"));