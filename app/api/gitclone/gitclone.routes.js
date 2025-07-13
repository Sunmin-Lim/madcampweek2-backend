// app/api/gitclone/gitclone.routes.js
const express = require('express');
const authenticateToken = require('../../middleware/authMiddleware'); // 인증 미들웨어 임포트
const gitcloneController = require('./gitclone.controller');  // gitcloneController 임포트
const router = express.Router();


// Git 리포지토리 클론 라우터
router.post('/clone-repo', authenticateToken, gitcloneController.gitclone);

module.exports = router;
