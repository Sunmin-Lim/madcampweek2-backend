// const express = require('express');
// const router = express.Router();
// const controller = require('./session.controller');
// const { validateBuildRun } = require('./session.validation'); // Assuming this file exists and exports validateBuildRun

// // ⭐️ [FIX] Corrected route handler name to match controller export
// // ⭐️ [FIX] Removed duplicate route definition for /build-run
// // This route now correctly includes the validation middleware.
// // router.post('/build-run', validateBuildRun, controller.createAndRunContainer); // <-- Renamed handler
// router.post('/build-run', validateBuildRun, (req, res, next) => {
//     console.log('Received request to /build-run');
//     console.log('Request Body:', req.body); // 요청에 포함된 데이터를 로그로 출력
  
//     // validateBuildRun 미들웨어가 실행된 후, 컨트롤러 메소드 실행 전에 로그 추가
//     next();
//   }, controller.createAndRunContainer);
  


// // 상태 조회
// // router.get('/status/:containerId', controller.getContainerStatus); // <-- Renamed handler
// router.get('/status/:containerId', (req, res, next) => {
//     console.log('Received request to /status');
//     console.log('Container ID:', req.params.containerId); // 경로 파라미터를 로그로 출력
  
//     next();
//   }, controller.getContainerStatus);
  


// // 컨테이너 중지
// // ⭐️ [FIX] Corrected route handler name to match controller export
// // router.post('/stop', controller.stopContainer); // <-- Renamed handler
// router.post('/stop', (req, res, next) => {
//     console.log('Received request to /stop');
//     console.log('Request Body:', req.body); // 요청 데이터 로그 출력
  
//     next();
//   }, controller.stopContainer);
  


// // 컨테이너 삭제
// // ⭐️ [FIX] Corrected route handler name to match controller export
// // router.delete('/remove/:containerId', controller.removeContainer); // <-- Renamed handler
// router.delete('/remove/:containerId', (req, res, next) => {
//     console.log('Received request to /remove');
//     console.log('Container ID:', req.params.containerId); // 경로 파라미터 로그 출력
  
//     next();
//   }, controller.removeContainer);
  


// // 세션 목록 조회
// // router.get('/', controller.getSessions);
// router.get('/', (req, res, next) => {
//     console.log('Received request to get session list');
//     next();
//   }, controller.getSessions);
  


// // ⭐️ [REVIEW/FIX] DB 세션 종료 (Potential duplicate/confusion)
// module.exports = router;




const express = require('express');
const router = express.Router();
const sessionController = require('./session.controller'); // Import the session controller
const { validateBuildRun } = require('./session.validation'); // Assuming this file exists and exports validateBuildRun

// Build Docker image and create session
router.post('/build', validateBuildRun, sessionController.buildContainer);

// Get session list for a user
router.get('/get', sessionController.getSessions);


router.get('/update', sessionController.updateSessionState);

// Get container status
router.get('/status/:containerId', sessionController.getContainerStatus);

// Stop a running container
router.post('/stop', sessionController.stopContainer);

// Remove a container
router.delete('/remove/:containerId', sessionController.removeContainer);

module.exports = router;