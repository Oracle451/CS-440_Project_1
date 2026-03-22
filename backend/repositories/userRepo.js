import { db } from "../db.js";

export const userRepo = {
  findById: (userId) =>
    db.query("SELECT * FROM users WHERE user_id = $1", [userId]),

  findByCredentials: (userId, password) =>
    db.query("SELECT * FROM users WHERE user_id = $1 AND password = $2", [userId, password]),

  create: (userId, password, name) =>
    db.query("INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)", [userId, password, name]),

  update: (userId, fields) => {
    const keys = Object.keys(fields);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const values = [...Object.values(fields), userId];
    return db.query(`UPDATE users SET ${sets} WHERE user_id = $${keys.length + 1}`, values);
  },

  delete: (userId) =>
    db.query("DELETE FROM users WHERE user_id = $1", [userId]),
};