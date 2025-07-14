const express = require('express');
const router = express.Router();
const communityService = require('../../services/communityService');

// --- Posts ---

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await communityService.getAllPosts();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new post
router.post('/posts', async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await communityService.createPost({ title, content });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add answer to post
router.post('/posts/:id/answers', async (req, res) => {
  try {
    const { text } = req.body;
    const post = await communityService.addAnswer(req.params.id, text);
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Links ---

// Get all links
router.get('/links', async (req, res) => {
  try {
    const links = await communityService.getAllLinks();
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new link
router.post('/links', async (req, res) => {
  try {
    const { name, url } = req.body;
    const link = await communityService.addLink({ name, url });
    res.status(201).json(link);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
