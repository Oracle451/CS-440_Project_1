import { db } from "../db.js";

export const postRepo = {
  findAll: () =>
    db.query("SELECT * FROM blogs ORDER BY date_created DESC"),

  findById: (id) =>
    db.query("SELECT * FROM blogs WHERE blog_id = $1", [id]),

  create: (creatorName, creatorUserId, title, body) =>
    db.query(
      "INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, NOW())",
      [creatorName, creatorUserId, title, body]
    ),

  update: (id, title, body) =>
    db.query("UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3", [title, body, id]),

  delete: (id) =>
    db.query("DELETE FROM blogs WHERE blog_id = $1", [id]),

  deleteByUser: (userId) =>
    db.query("DELETE FROM blogs WHERE creator_user_id = $1", [userId]),

  incrementLikes: (id) =>
    db.query("UPDATE blogs SET likes = likes + 1 WHERE blog_id = $1 RETURNING likes", [id]),

  incrementDislikes: (id) =>
    db.query("UPDATE blogs SET dislikes = dislikes + 1 WHERE blog_id = $1 RETURNING dislikes", [id]),
};