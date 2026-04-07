import pg from "pg";

// Create a connection pool to the user database.
// The Pool manages multiple connections automatically, allowing the service
// to handle concurrent requests without query conflicts unlike pg.Client,
// which can only execute one query at a time.
export const db = new pg.Pool({
  // Read connection settings from environment variables so the same code
  // works both locally and inside Docker without any changes.
  // The fallback values are used for local development outside of Docker.
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "users_db",
  password: process.env.DB_PASSWORD || "password",
  port: 5432,
});

// Log any unexpected database errors so they appear in the service logs.
// The pool will attempt to recover automatically but this ensures errors
// are visible when inspecting logs with docker-compose logs.
db.on("error", (err) => console.error("DB error:", err));

console.log("DB pool created");