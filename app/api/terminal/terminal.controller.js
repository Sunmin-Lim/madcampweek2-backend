const terminalService = require('./terminal.service');
const gitService = require('./git.service');
const sshService = require('./ssh.service');

// 컨테이너 내부 명령 실행
async function executeCommand(req, res) {
  const { containerId, command } = req.body;
  if (!containerId || !command) {
    return res.status(400).json({ error: 'containerId and command are required.' });
  }
  try {
    const result = await terminalService.execInContainer(containerId, command);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}

// Git 명령 실행
async function executeGitCommand(req, res) {
  const { containerId, gitCmd } = req.body;
  if (!containerId || !gitCmd) {
    return res.status(400).json({ error: 'containerId and gitCmd are required.' });
  }
  try {
    const result = await gitService.gitCommand(containerId, gitCmd);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}

// SSH 키 추가
async function addSSHKey(req, res) {
  const { containerId, privateKey } = req.body;
  if (!containerId || !privateKey) {
    return res.status(400).json({ error: 'containerId and privateKey are required.' });
  }
  try {
    await sshService.addSSHKey(containerId, privateKey);
    res.json({ message: 'SSH Key added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}

module.exports = {
  executeCommand,
  executeGitCommand,
  addSSHKey
};
