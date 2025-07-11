const { exec } = require('child_process');

function execInContainer(containerId, command) {
  return new Promise((resolve, reject) => {
    const cmd = `docker exec ${containerId} /bin/sh -c "${command}"`;
    console.log(`🟣 Running: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        // If there's a direct error object from exec, reject with its message or stderr
        console.error(`🔴 Error executing command "${command}" in container ${containerId}:`, error.message);
        console.error(`🔴 Stderr from command:`, stderr);
        // Prioritize stderr if it contains more specific information
        return reject(stderr || error.message);
      }
      if (stderr) {
        // If there's stderr output but no direct error object, treat it as an error
        // This handles cases where a command exits non-zero without a formal 'error' object
        console.error(`🔴 Command "${command}" in container ${containerId} produced stderr:`, stderr);
        return reject(stderr);
      }
      // Only resolve if no error and no stderr
      console.log(`🟢 Command "${command}" successful. Stdout:`, stdout.trim());
      resolve(stdout.trim());
    });
  });
}

module.exports = {
  execInContainer
};