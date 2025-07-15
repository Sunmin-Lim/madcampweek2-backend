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

// ✅ OLD: Crawl Google and just save (no return)
router.post('/crawl/google', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required.' });
    }

    await communityService.crawlGoogleAndSave(query);
    res.json({ message: '✅ 구글 크롤링 및 저장 완료!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ NEW: Crawl Google, save, and RETURN results
router.get('/searchGoogle', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Missing query parameter q' });
    }

    // 1. Crawl and save in DB
    await communityService.crawlGoogleAndSave(q);

    // 2. Immediately return the saved results
    const posts = await communityService.findPostsByTag(q);

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error during Google crawling and fetching results' });
  }

  const pinnedService = require('../../services/pinnedLinkService');
const jwt = require('jsonwebtoken');

function getUserIdFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded.userId;
  } catch {
    return null;
  }
}

router.get('/pinned-links', async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const links = await pinnedService.getPinnedLinks(userId);
  res.json(links);
});

router.post('/pinned-links', async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { name, url } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'Missing fields' });
  const link = await pinnedService.addPinnedLink(userId, name, url);
  res.status(201).json(link);
});

router.delete('/pinned-links', async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { url } = req.body;
  await pinnedService.removePinnedLink(userId, url);
  res.json({ message: 'Removed' });
});

});

module.exports = router;