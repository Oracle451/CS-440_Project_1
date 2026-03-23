// db.js - Database connection (unchanged)
import pg from "pg";

export const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "BlogPostApp",
  password: "password",
  port: 5432,
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("DB connection error:", err));
