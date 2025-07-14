const CommunityPost = require('../models/CommunityPost');
const UsefulLink = require('../models/UsefulLink');

// Posts
async function getAllPosts() {
  return await CommunityPost.find();
}

async function createPost({ title, content }) {
  const post = new CommunityPost({ title, content });
  return await post.save();
}

async function addAnswer(postId, text) {
  const post = await CommunityPost.findById(postId);
  if (!post) throw new Error('Post not found');
  post.answers.push({ text });
  return await post.save();
}

// Links
async function getAllLinks() {
  return await UsefulLink.find();
}

async function addLink({ name, url }) {
  const link = new UsefulLink({ name, url });
  return await link.save();
}

module.exports = {
  getAllPosts,
  createPost,
  addAnswer,
  getAllLinks,
  addLink,
};
