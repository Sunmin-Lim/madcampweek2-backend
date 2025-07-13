// app/api/gitclone/gitclone.routes.js
const express = require('express');
const authenticateToken = require('../../middleware/authMiddleware'); // 인증 미들웨어 임포트
const gitcloneController = require('./gitclone.controller');  // gitcloneController 임포트
const router = express.Router();


// Git 리포지토리 클론 라우터
router.post('/clone-repo', authenticateToken, gitcloneController.gitclone);

// 새로운 엔드포인트: userId 기반으로 clonedRepos 반환
router.get('/cloned-repos/:userId', authenticateToken, gitcloneController.getClonedRepos);  // userId로 클론된 리포지토리 목록 조회
// 요청 예시: GET /api/gitclone/cloned-repos/60b76d5f4f1a2a3f3d4f5f6a

module.exports = router;
