import { postRepo } from "../repositories/postRepo.js";

export const postService = {
  async getAll() {
    const result = await postRepo.findAll();
    return result.rows;
  },

  async getById(id) {
    const result = await postRepo.findById(id);
    if (result.rows.length === 0) throw new Error("Post not found.");
    return result.rows[0];
  },

  async create(user, title, content) {
    const creatorUserId = parseInt(user.user_id, 10);
    if (isNaN(creatorUserId)) throw new Error("Invalid user ID format.");
    await postRepo.create(user.name, creatorUserId, title, content);
  },

  async update(id, user, title, content) {
    const post = await postService.getById(id);
    const userIdAsInt = parseInt(user.user_id, 10);
    if (post.creator_user_id !== userIdAsInt) throw new Error("Unauthorized.");
    await postRepo.update(id, title, content);
  },

  async delete(id, user) {
    const post = await postService.getById(id);
    const userIdAsInt = parseInt(user.user_id, 10);
    if (post.creator_user_id !== userIdAsInt) throw new Error("Unauthorized.");
    await postRepo.delete(id);
  },

  async like(id) {
    const result = await postRepo.incrementLikes(id);
    if (result.rowCount === 0) throw new Error("Post not found.");
    return result.rows[0].likes;
  },

  async dislike(id) {
    const result = await postRepo.incrementDislikes(id);
    if (result.rowCount === 0) throw new Error("Post not found.");
    return result.rows[0].dislikes;
  },
};