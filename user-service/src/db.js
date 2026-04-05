import pg from "pg";

export const db = new pg.Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "users_db",
  password: process.env.DB_PASSWORD || "password",
  port: 5432,
});

db.on("error", (err) => console.error("DB error:", err));
console.log("DB pool created");