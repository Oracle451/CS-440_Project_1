import { userRepo } from "../repositories/userRepo.js";
import { postRepo } from "../repositories/postRepo.js";

export const authService = {
  async signup(userId, password, name) {
    const existing = await userRepo.findById(userId);
    if (existing.rows.length > 0) {
      throw new Error("User ID already exists.");
    }
    await userRepo.create(userId, password, name);
  },

  async signin(userId, password) {
    const result = await userRepo.findByCredentials(userId, password);
    if (result.rows.length === 0) {
      throw new Error("Invalid credentials.");
    }
    return result.rows[0];
  },

  async updateAccount(userId, { name, password }) {
    const fields = {};
    if (name) fields.name = name;
    if (password) fields.password = password;
    if (Object.keys(fields).length === 0) {
      throw new Error("Provide at least name or password to update.");
    }
    await userRepo.update(userId, fields);
    return fields;
  },

  async deleteAccount(userId) {
    await postRepo.deleteByUser(userId);
    await userRepo.delete(userId);
  },
};