import eventBus from "./eventBus.js";

eventBus.on("post:created", ({ creatorName, title }) => {
  console.log(`[post:created]  "${title}" by ${creatorName}`);
});

eventBus.on("post:updated", ({ postId, title }) => {
  console.log(`[post:updated]  post #${postId} → new title: "${title}"`);
});

eventBus.on("post:deleted", ({ postId, userId }) => {
  console.log(`[post:deleted]  post #${postId} deleted by user #${userId}`);
});

eventBus.on("post:liked", ({ postId, likes }) => {
  console.log(`[post:liked]    post #${postId} now has ${likes} like(s)`);
});

eventBus.on("post:disliked", ({ postId, dislikes }) => {
  console.log(`[post:disliked] post #${postId} now has ${dislikes} dislike(s)`);
});

eventBus.on("user:signedup", ({ userId }) => {
  console.log(`[user:signedup]  new user registered: ${userId}`);
});

eventBus.on("user:signedin", ({ userId }) => {
  console.log(`[user:signedin]  user signed in: ${userId}`);
});

eventBus.on("user:signedout", ({ userId }) => {
  console.log(`[user:signedout] user signed out: ${userId}`);
});

eventBus.on("account:updated", ({ userId }) => {
  console.log(`[account:updated] user #${userId} updated their account`);
});

eventBus.on("account:deleted", ({ userId }) => {
  console.log(`[account:deleted] user #${userId} deleted their account`);
});
