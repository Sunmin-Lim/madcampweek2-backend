const { exec } = require('child_process');

function gitCommand(containerId, gitCmd) {
  return new Promise((resolve, reject) => {
    const cmd = `docker exec ${containerId} /bin/sh -c "${gitCmd}"`;
    console.log(`🟣 Running Git Command: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`🔴 Error executing git command "${gitCmd}" in container ${containerId}:`, error.message);
        console.error(`🔴 Stderr from git command:`, stderr);
        return reject(stderr || error.message);
      }
      if (stderr) {
        console.error(`🔴 Git command "${gitCmd}" in container ${containerId} produced stderr:`, stderr);
        return reject(stderr);
      }
      console.log(`🟢 Git command "${gitCmd}" successful. Stdout:`, stdout.trim());
      resolve(stdout.trim());
    });
  });
}

module.exports = {
  gitCommand
};