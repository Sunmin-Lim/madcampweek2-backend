const express = require('express');
const router = express.Router();
const communityService = require('../../services/communityChatService');
const Person = require('../../models/person.model');
const authMiddleware = require('../../middleware/authMiddleware'); // ✅ add this

// ✅ Create new chat
router.post('/chats', authMiddleware, async (req, res) => {
  try {
    const { participants, isGroup, groupName } = req.body;
    const chat = await communityService.createChat(participants, isGroup, groupName);
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get user's chats
router.get('/chats/:userId', authMiddleware, async (req, res) => {
  try {
    const chats = await communityService.getChatsForUser(req.params.userId);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Send a message
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const { chatId, senderId, text } = req.body;
    const message = await communityService.addMessage(chatId, senderId, text);
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get messages in a chat
router.get('/messages/:chatId', authMiddleware, async (req, res) => {
  try {
    const messages = await communityService.getMessages(req.params.chatId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update user's location
router.post('/location', authMiddleware, async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;
    const user = await communityService.updateUserLocation(userId, lat, lng);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all users with online status and location
router.get('/people', authMiddleware, async (req, res) => {
  try {
    const people = await Person.find({}, 'username online location');
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
