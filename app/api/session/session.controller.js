// app/api/session/session.controller.js
const dockerManager = require('../../services/docker_manager'); // Adjust path
const Session = require('../../models/session.model'); // Adjust path

// ⭐️ [CLARIFICATION] This function is used by the '/build-run' route
exports.createAndRunContainer = async (req, res) => {
  const { user_id, localPath, imageName, resources } = req.body;
  try {
    await dockerManager.buildImage(localPath, imageName);
    const containerId = await dockerManager.runContainer(imageName, resources);

    const newSession = new Session({
      user_id,
      image_name: imageName,
      container_id: containerId,
      status: 'RUNNING',
      resources
    });
    await newSession.save();

    res.json({ message: 'Container created successfully!', containerId });
  } catch (error) {
    console.error("Error in createAndRunContainer:", error);
    res.status(500).json({ error: error.message });
  }
};

// ⭐️ [CLARIFICATION] This function is used by the '/' (GET) route
exports.getSessions = async (req, res) => {
  try {
    const { user_id } = req.query;
    const sessions = await Session.find({ user_id });
    res.json(sessions);
  } catch (error) {
    console.error("Error getting sessions:", error);
    res.status(500).json({ error: error.message });
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

// ⭐️ [CLARIFICATION] Example SSH key function
exports.addSshKey = async (req, res) => {
    const { containerId, privateKey } = req.body;
    try {
        // You would integrate dockerManager.execInContainer here
        res.status(200).json({ message: 'SSH Key added successfully' });
    } catch (error) {
        console.error("Error adding SSH key:", error);
        res.status(500).json({ error: error.message });
    }
};

// ⭐️ [CLARIFICATION] Example Git command function
exports.gitCommand = async (req, res) => {
    const { containerId, gitCmd } = req.body;
    try {
        // You would integrate dockerManager.execInContainer here
        res.status(200).json({ result: `Executed git command: ${gitCmd}` });
    } catch (error) {
        console.error("Error running git command:", error);
        res.status(500).json({ error: error.message });
    }
};

// ⭐️ [CLARIFICATION] Example Terminal execute function
exports.terminalExecute = async (req, res) => {
    const { containerId, command } = req.body;
    try {
        // You would integrate dockerManager.execInContainer here
        res.status(200).json({ result: `Executed command: ${command}` });
    } catch (error) {
        console.error("Error executing terminal command:", error);
        res.status(500).json({ error: error.message });
    }
};

// ⭐️ [REVIEW] If you need a `stopSession` function that takes an `id` from URL params,
// you would define it here and ensure it's exported.
// exports.stopSession = async (req, res) => { /* ... logic ... */ };