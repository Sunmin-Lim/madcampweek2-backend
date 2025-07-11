const express = require('express');
const router = express.Router();
const Session = require('../../models/session.model');

// 모든 세션 조회 (관리자)
router.get('/all', async (req, res) => {
  const sessions = await Session.find({});
  res.json(sessions);
});

module.exports = router;