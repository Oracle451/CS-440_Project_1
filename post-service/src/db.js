import pg from "pg";

export const db = new pg.Client({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "posts_db",
  password: process.env.DB_PASSWORD || "password",
  port: 5432,
});

db.connect()
  .then(() => console.log("Post DB connected"))
  .catch((err) => console.error("DB connection error:", err));