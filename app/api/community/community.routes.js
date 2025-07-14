const express = require('express');
const router = express.Router();
const communityService = require('../../services/communityService');

// ✅ GET all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await communityService.getAllPosts();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ CREATE a new post with tags
router.post('/posts', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const post = await communityService.createPost({ title, content, tags });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Add answer to a post
router.post('/posts/:id/answers', async (req, res) => {
  try {
    const { text } = req.body;
    const post = await communityService.addAnswer(req.params.id, text);
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ SEARCH posts by tag
router.get('/posts/search', async (req, res) => {
  try {
    const { tag } = req.query;
    if (!tag) {
      return res.status(400).json({ error: 'Tag query parameter is required.' });
    }
    const posts = await communityService.findPostsByTag(tag);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET top 3 most viewed posts
router.get('/posts/top', async (req, res) => {
  try {
    const posts = await communityService.getTopPosts();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Increment view count
router.post('/posts/:id/view', async (req, res) => {
  try {
    const post = await communityService.incrementPostView(req.params.id);
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ GET all useful links
router.get('/links', async (req, res) => {
  try {
    const links = await communityService.getAllLinks();
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add new useful link
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
