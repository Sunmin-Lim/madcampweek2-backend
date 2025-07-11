const { exec } = require('child_process');

async function addSSHKey(containerId, privateKey) {
  // Use a "Here Document" for robust multi-line string passing
  // This prevents shell parsing issues with newlines and special characters within the key.
  // The 'EOF_KEY' delimiter is arbitrary, but should not appear in the privateKey itself.
  const command = `cat <<'EOF_KEY' > /root/.ssh/id_rsa
${privateKey}
EOF_KEY
chmod 600 /root/.ssh/id_rsa`;

  return new Promise((resolve, reject) => {
    // The outer command for docker exec needs to correctly embed the shell command.
    // Using double quotes around `${command}` is fine here because `command` is already
    // a fully formed shell script string including newlines.
    const finalCmd = `docker exec ${containerId} /bin/sh -c "${command}"`;

    console.log(`🟣 Adding SSH Key: ${finalCmd}`);
    exec(finalCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`🔴 Error adding SSH key to container ${containerId}:`, error.message);
        console.error(`🔴 Stderr from SSH key command:`, stderr);
        return reject(stderr || error.message);
      }
      if (stderr) {
        console.error(`🔴 SSH key command in container ${containerId} produced stderr:`, stderr);
        return reject(stderr);
      }
      console.log(`🟢 SSH key added successfully. Stdout:`, stdout.trim());
      resolve(stdout.trim()); // Should be empty string on success
    });
  });
}

module.exports = {
  addSSHKey
};