// app/api/domain/domain.controller.js
const dockerManager = require('../../services/docker_manager'); // Ensure correct path
const Session = require('../../models/session.model'); // Ensure correct path

const { updateSessionState } = require('../session/session.controller'); // Import the session controller
const ClonedRepo = require('../../../models/ClonedRepo');


// docker run and update the session state
// exports.runContainer = async (req, res) => {
//     const { session_id, cpu, memory, port } = req.body; // CPU, 메모리, 포트 추가


//   // 요청 본문에 필수 값들이 모두 있는지 확인
//   if (!session_id || !cpu || !memory || !port) {
//     return res.status(400).json({ error: 'Missing required parameters: session_id, cpu, memory, port' });
//   }

//     try {
//         console.log(`Received request to run container with session_id: ${session_id}`);
        
//         // 세션 정보 가져오기
//         const session = await Session.findById(session_id);
//         if (!session) {
//             console.log(`Session with ID ${session_id} not found`);
//             return res.status(404).json({ message: "Session not found" });
//         }

//         console.log(`Session found: ${session}`);
        
//         // Docker 실행에 필요한 포트 설정
//         const mappedPort = port || '8080';  // 기본 포트 설정, 제공되지 않으면 8080 사용
        
//         // Docker 명령어 실행 - CPU, 메모리, 포트 설정
//         const containerId = await dockerManager.runContainer(
//             session.image_name, 
//             session.resources, 
//             cpu,  // CPU 설정
//             memory,  // 메모리 설정
//             mappedPort  // 포트 설정
//         );
//         console.log(`Container started with ID: ${containerId}`);
        
//         // 세션 업데이트
//         await updateSessionState(session_id, 'RUNNING');
//         session.container_id = containerId;
//         await session.save();
        
//         res.json({
//             message: 'Container is now running!',
//             containerId,
//             sessionId: session._id,
//             port: mappedPort
//         });
//     } catch (error) {
//         console.error("Error running container:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

exports.runContainer = async (req, res) => {
    const { session_id, cpu, memory, port, repo_url } = req.body;
  
    // 요청 본문에 필수 값들이 모두 있는지 확인
    if (!session_id || !cpu || !memory || !port) {
      return res.status(400).json({ error: 'Missing required parameters: session_id, cpu, memory, port' });
    }
  
    try {
      console.log(`Received request to run container with session_id: ${session_id}`);
  
      // 세션 정보 가져오기
      const session = await Session.findById(session_id);
      if (!session) {
        console.log(`Session with ID ${session_id} not found`);
        return res.status(404).json({ message: "Session not found" });
      }
  
      console.log(`Session found: ${session}`);
  
      // Docker 실행에 필요한 포트 설정
      const mappedPort = port || '8080';  // 기본 포트 설정, 제공되지 않으면 8080 사용
  
      // Docker 명령어 실행 - CPU, 메모리, 포트 설정
      const containerId = await dockerManager.runContainer(
        session.image_name, 
        session.resources, 
        cpu,  
        memory,  
        mappedPort
      );


  
      console.log(`Container started with ID: ${containerId}`);
  
      // 세션 상태 업데이트
      await updateSessionState(session_id, 'RUNNING');  // req, res 없이 session_id와 상태만 전달
      session.container_id = containerId;
      // last_active_at 필드 업데이트 (현재 시간으로)
      // session.last_active_at = Date.now();
      session.created_at = Date.now(); // 세션 생성 시간 업데이트
      await session.save();

      // cloned Repo 업데이트
      const user_id = session.user_id;  // 세션에서 user_id 가져오기
      const updatedRepo = await ClonedRepo.findOneAndUpdate(
        { user_id, repo_url },
        { can_push: true },
        { new: true } // 업데이트된 문서를 반환
      );
  
      if (!updatedRepo) {
        console.log('No matching cloned repository found for the update');
      } else {
        console.log('Cloned repo updated:', updatedRepo);
      }

      res.json({
        message: 'Container is now running!',
        containerId,
        sessionId: session._id,
        port: mappedPort
      });
    } catch (error) {
      console.error("Error running container:", error);
      res.status(500).json({ error: error.message });
    }
  };