// app/api/session/session.controller.js
const dockerManager = require('../../services/docker_manager'); // Adjust path
const Session = require('../../models/session.model'); // Adjust path
const ClonedRepo = require('../../../models/ClonedRepo');

// // ⭐️ Build Docker image and store session
// exports.buildContainer = async (req, res) => {
//   const { user_id, localPath, imageName, repo_url } = req.body;
//   try {
//     // Build Docker image
//     await dockerManager.buildImage(localPath, imageName);

//     // Store session information in DB (initially with status 'built')
//     const newSession = new Session({
//       user_id,
//       image_name: imageName,
//       status: 'BUILT', // Mark as built
//       created_at: new Date(),
//     });
//     await newSession.save();


//     /* 
//     user_id에 해당하는 cloned_repo에 대해서 session_id 설정해주기
//     user_id와 repo_url 기반으로 cloneedRepo를 찾기

//     ClonedRepo.findOneAndUpdate 사용하기
//     findOneAndUpdate를 사용하여 session_id를 업데이트
//     */
//     // ✅ user_id와 repo_url로 해당 ClonedRepo를 찾아서 session_id 업데이트
//     const updatedRepo = await ClonedRepo.findOneAndUpdate(
//       { user_id, repo_url },                     // 조건
//       { session_id: newSession._id, can_push: true },            // 업데이트 내용
//       { new: true }                              // 업데이트 후 문서 반환
//     );

//     if (!updatedRepo) {
//       console.warn(`⚠️ ClonedRepo not found for user_id: ${user_id}, repo_url: ${repo_url}`);
//     } else {
//       console.log(`✅ ClonedRepo updated with session_id: ${newSession._id}`);
//     }


//     res.json({
//       message: 'Container built successfully!',
//       sessionId: newSession._id, // Return sessionId so the user can run it later
//     });
//   } catch (error) {
//     console.error("Error building container:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// ⭐️ Build Docker image and store session
exports.buildContainer = async (req, res) => {
  const { user_id, localPath, imageName, repo_url } = req.body;
  try {
    // Build Docker image
    await dockerManager.buildImage(localPath, imageName);

    // Try to find an existing session with the same user_id and image_name
    let session = await Session.findOneAndUpdate(
      { user_id, image_name: imageName }, // Search condition: user_id and image_name
      { status: 'BUILT', created_at: new Date() }, // If exists, update status and created_at
      { new: true, upsert: true } // new: return updated document, upsert: create if not found
    );

    // If session doesn't exist, it will be created due to upsert: true
    if (!session) {
      console.log("New session created");
    } else {
      console.log("Existing session updated");
    }

    // ✅ user_id와 repo_url로 해당 ClonedRepo를 찾아서 session_id 업데이트
    const updatedRepo = await ClonedRepo.findOneAndUpdate(
      { user_id, repo_url },                     // 조건
      { session_id: session._id, can_push: false }, // 업데이트 내용
      { new: true }                               // 업데이트 후 문서 반환
    );

    if (!updatedRepo) {
      console.warn(`⚠️ ClonedRepo not found for user_id: ${user_id}, repo_url: ${repo_url}`);
    } else {
      console.log(`✅ ClonedRepo updated with session_id: ${session._id}`);
    }

    res.json({
      message: 'Container built successfully!',
      sessionId: session._id, // Return sessionId so the user can run it later
    });
  } catch (error) {
    console.error("Error building container:", error);
    res.status(500).json({ error: error.message });
  }
};

// ⭐️ [CLARIFICATION] This function is used by the '/' (GET) route => /get
exports.getSessions = async (req, res) => {
  try {
    const { user_id } = req.query;
    console.log("Received user_id:", user_id);  // user_id 로그로 확인

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const sessions = await Session.find({ user_id });
    res.json(sessions);
  } catch (error) {
    console.error("Error getting sessions:", error);
    res.status(500).json({ error: error.message });
  }
};

// ⭐️ Update session state
exports.updateSessionState = async (session_id, newStatus) => {
  // session_id와 newStatus가 전달되었는지 확인
  if (!session_id || !newStatus) {
    throw new Error('Missing required parameters: session_id, newStatus');
  }

  try {
    // 세션 조회
    const session = await Session.findById(session_id);
    if (!session) {
      throw new Error('Session not found');
    }

    // 세션 상태를 변경
    session.status = newStatus;
    await session.save();  // DB에 반영

    console.log(`Session state updated to ${newStatus}`);
  } catch (error) {
    console.error("Error updating session state:", error);
    throw new Error("Error updating session state");
  }
};

// ⭐️ [CLARIFICATION] This function is used by the '/status/:containerId' route
exports.getContainerStatus = async (req, res) => {
  try {
    const { containerId } = req.params;
    const status = await dockerManager.getContainerStatus(containerId);
    res.json({ status });
  } catch (error) {
    console.error("Error getting container status:", error);
    res.status(500).json({ error: error.message });
  }
};

// ⭐️ [CLARIFICATION] This function is used by the '/stop' (POST) route
exports.stopContainer = async (req, res) => { // <-- Matches the name used in routes
  try {
    const { containerId, sessionId } = req.body;
    await dockerManager.stopContainer(containerId);
    await Session.findByIdAndUpdate(sessionId, { status: 'STOPPED', last_active_at: new Date() }, { new: true});
    // session.last_active_at = Date.now();

    // Stop container는 할게 없음


    res.json({ message: 'Container stopped' });
  } catch (error) {
    console.error("Error stopping container:", error);
    res.status(500).json({ error: error.message });
  }
};

// ⭐️ [CLARIFICATION] This function is used by the '/remove/:containerId' route
exports.removeContainer = async (req, res) => { // <-- Matches the name used in routes
  try {
    const { containerId, sessionId } = req.params;
    await dockerManager.removeContainer(containerId);
    await Session.findOneAndDelete({ container_id: containerId });
    
    await ClonedRepo.findOneAndUpdate(
      { session_id: sessionId },
      { $set: { session_id: null } }
    );

    res.json({ message: 'Container removed' });
  } catch (error) {
    console.error("Error removing container:", error);
    res.status(500).json({ error: error.message });
  }
};



// ⭐️ [REVIEW] If you need a `stopSession` function that takes an `id` from URL params,
// you would define it here and ensure it's exported.
// exports.stopSession = async (req, res) => { /* ... logic ... */ };