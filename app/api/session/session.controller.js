// // app/api/session/session.controller.js
// const dockerManager = require('../../services/docker_manager'); // Adjust path
// const Session = require('../../models/session.model'); // Adjust path

// // ⭐️ [CLARIFICATION] This function is used by the '/build-run' route
// exports.createAndRunContainer = async (req, res) => {
//   const { user_id, localPath, imageName, resources } = req.body;
//   try {
//     await dockerManager.buildImage(localPath, imageName);
//     const containerId = await dockerManager.runContainer(imageName, resources);

//     const newSession = new Session({
//       user_id,
//       image_name: imageName,
//       container_id: containerId,
//       status: 'RUNNING',
//       resources
//     });
//     await newSession.save();

//     res.json({ message: 'Container created successfully!', containerId });
//   } catch (error) {
//     console.error("Error in createAndRunContainer:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // ⭐️ [CLARIFICATION] This function is used by the '/' (GET) route
// exports.getSessions = async (req, res) => {
//   try {
//     const { user_id } = req.query;
//     const sessions = await Session.find({ user_id });
//     res.json(sessions);
//   } catch (error) {
//     console.error("Error getting sessions:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // ⭐️ [CLARIFICATION] This function is used by the '/status/:containerId' route
// exports.getContainerStatus = async (req, res) => {
//   try {
//     const { containerId } = req.params;
//     const status = await dockerManager.getContainerStatus(containerId);
//     res.json({ status });
//   } catch (error) {
//     console.error("Error getting container status:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // ⭐️ [CLARIFICATION] This function is used by the '/stop' (POST) route
// exports.stopContainer = async (req, res) => { // <-- Matches the name used in routes
//   try {
//     const { containerId, sessionId } = req.body;
//     await dockerManager.stopContainer(containerId);
//     await Session.findByIdAndUpdate(sessionId, { status: 'STOPPED' });
//     res.json({ message: 'Container stopped' });
//   } catch (error) {
//     console.error("Error stopping container:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // ⭐️ [CLARIFICATION] This function is used by the '/remove/:containerId' route
// exports.removeContainer = async (req, res) => { // <-- Matches the name used in routes
//   try {
//     const { containerId } = req.params;
//     await dockerManager.removeContainer(containerId);
//     await Session.findOneAndDelete({ container_id: containerId });
//     res.json({ message: 'Container removed' });
//   } catch (error) {
//     console.error("Error removing container:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // ⭐️ [CLARIFICATION] Example SSH key function
// exports.addSshKey = async (req, res) => {
//     const { containerId, privateKey } = req.body;
//     try {
//         // You would integrate dockerManager.execInContainer here
//         res.status(200).json({ message: 'SSH Key added successfully' });
//     } catch (error) {
//         console.error("Error adding SSH key:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // ⭐️ [CLARIFICATION] Example Git command function
// exports.gitCommand = async (req, res) => {
//     const { containerId, gitCmd } = req.body;
//     try {
//         // You would integrate dockerManager.execInContainer here
//         res.status(200).json({ result: `Executed git command: ${gitCmd}` });
//     } catch (error) {
//         console.error("Error running git command:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // ⭐️ [CLARIFICATION] Example Terminal execute function
// exports.terminalExecute = async (req, res) => {
//     const { containerId, command } = req.body;
//     try {
//         // You would integrate dockerManager.execInContainer here
//         res.status(200).json({ result: `Executed command: ${command}` });
//     } catch (error) {
//         console.error("Error executing terminal command:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // ⭐️ [REVIEW] If you need a `stopSession` function that takes an `id` from URL params,
// // you would define it here and ensure it's exported.
// // exports.stopSession = async (req, res) => { /* ... logic ... */ };


// app/api/session/session.controller.js
const dockerManager = require('../../services/docker_manager'); // Adjust path
const Session = require('../../models/session.model'); // Adjust path

// ⭐️ Build Docker image and store session
exports.buildContainer = async (req, res) => {
  const { user_id, localPath, imageName } = req.body;
  try {
    // Build Docker image
    await dockerManager.buildImage(localPath, imageName);

    // Store session information in DB (initially with status 'built')
    const newSession = new Session({
      user_id,
      image_name: imageName,
      status: 'BUILT', // Mark as built
    });
    await newSession.save();

    res.json({
      message: 'Container built successfully!',
      sessionId: newSession._id, // Return sessionId so the user can run it later
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
// exports.updateSessionState = async (req, res) => {
//   const { session_id, newStatus } = req.body;  // session_id와 새로운 상태를 요청 본문으로 받음
//   try {
//     // 세션 조회
//     const session = await Session.findById(session_id);
//     if (!session) {
//       return res.status(404).json({ message: "Session not found" });
//     }

//     // 세션 상태를 변경
//     session.status = newStatus;  // 새로운 상태로 업데이트
//     await session.save();  // DB에 반영

//     res.json({
//       message: `Session state updated to ${newStatus}`,
//       sessionId: session._id,
//       status: session.status,
//     });
//   } catch (error) {
//     console.error("Error updating session state:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.updateSessionState = async (req, res) => {
//   const { session_id, newStatus } = req.body;  // session_id와 새로운 상태를 요청 본문으로 받음

//   // session_id와 newStatus가 전달되었는지 확인
//   if (!session_id || !newStatus) {
//     return res.status(400).json({ error: 'Missing required parameters: session_id, newStatus' });
//   }

//   try {
//     // 세션 조회
//     const session = await Session.findById(session_id);
//     if (!session) {
//       return res.status(404).json({ message: "Session not found" });
//     }

//     // 세션 상태를 변경
//     session.status = newStatus;  // 새로운 상태로 업데이트
//     await session.save();  // DB에 반영

//     res.json({
//       message: `Session state updated to ${newStatus}`,
//       sessionId: session._id,
//       status: session.status,
//     });
//   } catch (error) {
//     console.error("Error updating session state:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


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
    await Session.findByIdAndUpdate(sessionId, { status: 'STOPPED' });
    res.json({ message: 'Container stopped' });
  } catch (error) {
    console.error("Error stopping container:", error);
    res.status(500).json({ error: error.message });
  }
};

// ⭐️ [CLARIFICATION] This function is used by the '/remove/:containerId' route
exports.removeContainer = async (req, res) => { // <-- Matches the name used in routes
  try {
    const { containerId } = req.params;
    await dockerManager.removeContainer(containerId);
    await Session.findOneAndDelete({ container_id: containerId });
    res.json({ message: 'Container removed' });
  } catch (error) {
    console.error("Error removing container:", error);
    res.status(500).json({ error: error.message });
  }
};



// ⭐️ [REVIEW] If you need a `stopSession` function that takes an `id` from URL params,
// you would define it here and ensure it's exported.
// exports.stopSession = async (req, res) => { /* ... logic ... */ };