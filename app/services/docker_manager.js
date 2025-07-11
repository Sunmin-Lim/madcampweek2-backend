// app/services/docker_manager.js
const { exec } = require('child_process');

/**
 * Builds a Docker image.
 * @param {string} localPath The path to the Dockerfile context.
 * @param {string} imageName The name/tag for the Docker image.
 * @returns {Promise<void>} A promise that resolves on success or rejects on error.
 */
function buildImage(localPath, imageName) {
  console.log(`🛠️ Building Docker image: ${imageName} from context: ${localPath}`);
  return new Promise((resolve, reject) => {
    // Docker build command: -t for tag, last arg is build context path
    const cmd = `docker build -t ${imageName} ${localPath}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        // Log both error.message and stderr for full context
        console.error(`🔴 Docker Build Error for ${imageName} (Path: ${localPath}):`, error.message);
        console.error(`🔴 Build Stderr:`, stderr);
        return reject(new Error(`Docker build failed for image ${imageName} from ${localPath}: ${stderr || error.message}`));
      }
      if (stderr) {
        // Warnings from Docker build are often in stderr. Log them.
        console.warn(`🟡 Docker Build Warning/Stderr for ${imageName} (Path: ${localPath}):`, stderr);
      }
      console.log(`✅ Build Success for ${imageName}. Output snippet: ${stdout.trim().substring(0, 200)}...`); // Log a snippet
      resolve();
    });
  });
}

/**
 * Runs a Docker container from a given image.
 * @param {string} imageName The name of the Docker image to run.
 * @param {object} resources Optional: CPU and memory limits (e.g., { cpu: '0.5', memory: '256m' }).
 * @returns {Promise<string>} A promise that resolves with the container ID on success.
 */
function runContainer(imageName, resources = {}) {
  return new Promise((resolve, reject) => {
    let cmd = `docker run -d`; // -d for detached mode

    // Add resource limits if provided
    if (resources.cpu) cmd += ` --cpus=${resources.cpu}`; // Docker uses --cpus for CPU limit
    if (resources.memory) cmd += ` --memory=${resources.memory}`; // Docker uses --memory for memory limit

    cmd += ` ${imageName}`;

    console.log(`🚀 Running container from image: ${imageName} with command: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`🔴 Docker Run Error for ${imageName}:`, error.message);
        console.error(`🔴 Run Stderr:`, stderr);
        return reject(new Error(`Docker run failed for image ${imageName}: ${stderr || error.message}`));
      }
      if (stderr) {
        console.warn(`🟡 Docker Run Warning/Stderr for ${imageName}:`, stderr);
      }
      const containerId = stdout.trim();
      console.log(`✅ Container ID: ${containerId}`);
      resolve(containerId);
    });
  });
}

/**
 * Gets the status of a Docker container.
 * @param {string} containerId The ID of the container.
 * @returns {Promise<string>} A promise that resolves with the container status (e.g., 'running', 'exited') or 'not_found'.
 */
function getContainerStatus(containerId) {
  return new Promise((resolve, reject) => {
    const cmd = `docker inspect --format='{{.State.Status}}' ${containerId}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`🔴 Docker Inspect Error for ${containerId}:`, error.message);
        console.error(`🔴 Inspect Stderr:`, stderr);
        // If container not found, inspect returns a non-zero exit code
        if (stderr.includes('No such object') || stderr.includes('Error: No such container')) {
            return resolve('not_found');
        }
        return reject(new Error(`Docker inspect failed for ${containerId}: ${stderr || error.message}`));
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Stops a Docker container.
 * @param {string} containerId The ID of the container.
 * @returns {Promise<string>} A promise that resolves with the stopped container ID on success.
 */
function stopContainer(containerId) {
  return new Promise((resolve, reject) => {
    const cmd = `docker stop ${containerId}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`🔴 Docker Stop Error for ${containerId}:`, error.message);
        console.error(`🔴 Stop Stderr:`, stderr);
        return reject(new Error(`Docker stop failed for ${containerId}: ${stderr || error.message}`));
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Removes a Docker container.
 * @param {string} containerId The ID of the container.
 * @returns {Promise<string>} A promise that resolves with the removed container ID on success.
 */
function removeContainer(containerId) {
  return new Promise((resolve, reject) => {
    const cmd = `docker rm ${containerId}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`🔴 Docker Remove Error for ${containerId}:`, error.message);
        console.error(`🔴 Remove Stderr:`, stderr);
        return reject(new Error(`Docker remove failed for ${containerId}: ${stderr || error.message}`));
      }
      resolve(stdout.trim());
    });
  });
}

module.exports = {
  buildImage,
  runContainer,
  getContainerStatus,
  stopContainer,
  removeContainer
};