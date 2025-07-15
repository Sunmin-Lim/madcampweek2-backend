const { CommunityPost, UsefulLink } = require('../models/Community');
const { googleSearchAndSave } = require('./googleCrawler');

// 🔹 POSTS
async function getAllPosts() {
  return await CommunityPost.find();
}

async function createPost({ title, content, tags }) {
  return await CommunityPost.create({ title, content, tags });
}

async function addAnswer(postId, text) {
  const post = await CommunityPost.findById(postId);
  if (!post) throw new Error('Post not found');
  post.answers.push({ text });
  await post.save();
  return post;
}

async function findPostsByTag(tag) {
  return await CommunityPost.find({ tags: tag });
}

async function getTopPosts(limit = 3) {
  return await CommunityPost.find().sort({ views: -1 }).limit(limit);
}

async function incrementPostView(postId) {
  return await CommunityPost.findByIdAndUpdate(
    postId,
    { $inc: { views: 1 } },
    { new: true }
  );
}

// 🔹 LINKS
async function getAllLinks() {
  return await UsefulLink.find();
}

async function addLink({ name, url }) {
  return await UsefulLink.create({ name, url });
}

// 🔹 GOOGLE CRAWLER
async function crawlGoogleAndSave(query) {
  await googleSearchAndSave(query);
}

module.exports = {
  getAllPosts,
  createPost,
  addAnswer,
  findPostsByTag,
  getTopPosts,
  incrementPostView,
  getAllLinks,
  addLink,
  crawlGoogleAndSave
};
