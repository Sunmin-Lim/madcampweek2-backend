const { CommunityPost, UsefulLink } = require('../models/Community');

async function getAllPosts() {
  return await CommunityPost.find();
}

async function createPost({ title, content }) {
  return await CommunityPost.create({ title, content });
}

async function addAnswer(postId, text) {
  const post = await CommunityPost.findById(postId);
  if (!post) throw new Error('Post not found');
  post.answers.push({ text });
  await post.save();
  return post;
}

async function getAllLinks() {
  return await UsefulLink.find();
}

async function addLink({ name, url }) {
  return await UsefulLink.create({ name, url });
}

module.exports = {
  getAllPosts,
  createPost,
  addAnswer,
  getAllLinks,
  addLink
};
