import express from "express";
import bodyParser from "body-parser";
import authRouter from "./auth.js";

const app = express();

// Parse incoming JSON request bodies so route handlers can access req.body
app.use(bodyParser.json());

app.use((req, res, next) => {
  const userHeader = req.headers["x-user"];
  if (userHeader) {
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

// Mount the user router
app.use("/api/users", authRouter);

app.listen(3001, () => console.log("User service on port 3001"));