const express = require('express');
const router = express.Router();
const controller = require('./session.controller');
const { validateBuildRun } = require('./session.validation'); // Assuming this file exists and exports validateBuildRun

// ⭐️ [FIX] Corrected route handler name to match controller export
// ⭐️ [FIX] Removed duplicate route definition for /build-run
// This route now correctly includes the validation middleware.
router.post('/build-run', validateBuildRun, controller.createAndRunContainer); // <-- Renamed handler

// 상태 조회
router.get('/status/:containerId', controller.getContainerStatus); // <-- Renamed handler

// 컨테이너 중지
// ⭐️ [FIX] Corrected route handler name to match controller export
router.post('/stop', controller.stopContainer); // <-- Renamed handler

// 컨테이너 삭제
// ⭐️ [FIX] Corrected route handler name to match controller export
router.delete('/remove/:containerId', controller.removeContainer); // <-- Renamed handler

// 세션 목록 조회
router.get('/', controller.getSessions);

// ⭐️ [REVIEW/FIX] DB 세션 종료 (Potential duplicate/confusion)
module.exports = router;
