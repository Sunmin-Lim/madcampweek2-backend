// const { exec } = require('child_process');

// /**
//  * Builds a Docker image.
//  */
// function buildImage(localPath, imageName) {
//   console.log(`🛠️ Building Docker image: ${imageName} from context: ${localPath}`);
//   return new Promise((resolve, reject) => {
//     const cmd = `docker build -t ${imageName} ${localPath}`;
//     exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`🔴 Docker Build Error:`, error.message);
//         console.error(`🔴 Build Stderr:`, stderr);
//         return reject(new Error(stderr || error.message));
//       }
//       if (stderr) {
//         console.warn(`🟡 Docker Build Warning/Stderr:`, stderr);
//       }
//       console.log(`✅ Build Success. Snippet: ${stdout.trim().substring(0, 200)}...`);
//       resolve();
//     });
//   });
// }

// /**
//  * Runs a Docker container from a given image.
//  */
// function runContainer(imageName, resources = {}) {
//   return new Promise((resolve, reject) => {
//     let cmd = `docker run -d`;
//     if (resources.cpu) cmd += ` --cpus=${resources.cpu}`;
//     if (resources.memory) cmd += ` --memory=${resources.memory}`;
//     cmd += ` ${imageName}`;

//     console.log(`🚀 Running container: ${cmd}`);
//     exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`🔴 Docker Run Error:`, error.message);
//         console.error(`🔴 Run Stderr:`, stderr);
//         return reject(new Error(stderr || error.message));
//       }
//       if (stderr) {
//         console.warn(`🟡 Docker Run Warning/Stderr:`, stderr);
//       }
//       const containerId = stdout.trim();
//       console.log(`✅ Container ID: ${containerId}`);
//       resolve(containerId);
//     });
//   });
// }

// /**
//  * Gets the status of a Docker container.
//  */
// function getContainerStatus(containerId) {
//   return new Promise((resolve, reject) => {
//     const cmd = `docker inspect --format='{{.State.Status}}' ${containerId}`;
//     exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         if (stderr.includes('No such object') || stderr.includes('Error: No such container')) {
//           return resolve('not_found');
//         }
//         console.error(`🔴 Docker Inspect Error:`, error.message);
//         console.error(`🔴 Inspect Stderr:`, stderr);
//         return reject(new Error(stderr || error.message));
//       }
//       resolve(stdout.trim());
//     });
//   });
// }

// /**
//  * Stops a Docker container.
//  */
// function stopContainer(containerId) {
//   return new Promise((resolve, reject) => {
//     const cmd = `docker stop ${containerId}`;
//     exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`🔴 Docker Stop Error:`, error.message);
//         console.error(`🔴 Stop Stderr:`, stderr);
//         return reject(new Error(stderr || error.message));
//       }
//       resolve(stdout.trim());
//     });
//   });
// }

// /**
//  * Removes a Docker container, force-stopping if needed.
//  */
// function removeContainer(containerId) {
//   return new Promise((resolve, reject) => {
//     const cmd = `docker rm -f ${containerId}`;  // <- critical fix
//     exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`🔴 Docker Remove Error:`, error.message);
//         console.error(`🔴 Remove Stderr:`, stderr);
//         return reject(new Error(stderr || error.message));
//       }
//       console.log(`✅ Container ${containerId} removed successfully.`);
//       resolve(stdout.trim());
//     });
//   });
// }

// module.exports = {
//   buildImage,
//   runContainer,
//   getContainerStatus,
//   stopContainer,
//   removeContainer
// };


const { exec } = require('child_process');

/**
 * Builds a Docker image.
 */
function buildImage(localPath, imageName) {
  console.log(`🛠️ Building Docker image: ${imageName} from context: ${localPath}`);
  return new Promise((resolve, reject) => {
    const cmd = `docker build -t ${imageName} ${localPath}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`🔴 Docker Build Error:`, error.message);
        console.error(`🔴 Build Stderr:`, stderr);
        return reject(new Error(stderr || error.message));
      }
      if (stderr) {
        console.warn(`🟡 Docker Build Warning/Stderr:`, stderr);
      }
      console.log(`✅ Build Success. Snippet: ${stdout.trim().substring(0, 200)}...`);
      resolve();
    });
  });
}

// /**
//  * Runs a Docker container from a given image.
//  */
// function runContainer(imageName, resources = {}) {
//   return new Promise((resolve, reject) => {
//     let cmd = `docker run -d`;
//     if (resources.cpu) cmd += ` --cpus=${resources.cpu}`;
//     if (resources.memory) cmd += ` --memory=${resources.memory}`;
//     cmd += ` ${imageName}`;

//     console.log(`🚀 Running container: ${cmd}`);
//     exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`🔴 Docker Run Error:`, error.message);
//         console.error(`🔴 Run Stderr:`, stderr);
//         return reject(new Error(stderr || error.message));
//       }
//       if (stderr) {
//         console.warn(`🟡 Docker Run Warning/Stderr:`, stderr);
//       }
//       const containerId = stdout.trim();
//       console.log(`✅ Container ID: ${containerId}`);
//       resolve(containerId);
//     });
//   });
// }



/**
 * Runs a Docker container from a given image with specified resources and port mappings.
 */
function runContainer(imageName, resources = {}) {
  return new Promise((resolve, reject) => {
    let cmd = `docker run -d`;

    // CPU 설정
    if (resources.cpu) {
      cmd += ` --cpus=${resources.cpu}`;
    }

    // 메모리 설정
    if (resources.memory) {
      cmd += ` --memory=${resources.memory}`;
    }

    // 포트 매핑 설정
    if (resources.port) {
      cmd += ` -p ${resources.port}`;
    }

    // 이미지 이름 추가
    cmd += ` ${imageName}`;

    console.log(`🚀 Running container: ${cmd}`);
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`🔴 Docker Run Error:`, error.message);
        console.error(`🔴 Run Stderr:`, stderr);
        return reject(new Error(stderr || error.message));
      }
      if (stderr) {
        console.warn(`🟡 Docker Run Warning/Stderr:`, stderr);
      }

      const containerId = stdout.trim();
      console.log(`✅ Container ID: ${containerId}`);
      resolve(containerId);
    });
  });
}

/**
 * Gets the status of a Docker container.
 */
function getContainerStatus(containerId) {
  return new Promise((resolve, reject) => {
    const cmd = `docker inspect --format='{{.State.Status}}' ${containerId}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        if (stderr.includes('No such object') || stderr.includes('Error: No such container')) {
          return resolve('not_found');
        }
        console.error(`🔴 Docker Inspect Error:`, error.message);
        console.error(`🔴 Inspect Stderr:`, stderr);
        return reject(new Error(stderr || error.message));
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Stops a Docker container.
 */
function stopContainer(containerId) {
  return new Promise((resolve, reject) => {
    const cmd = `docker stop ${containerId}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`🔴 Docker Stop Error:`, error.message);
        console.error(`🔴 Stop Stderr:`, stderr);
        return reject(new Error(stderr || error.message));
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Removes a Docker container, force-stopping if needed.
 */
function removeContainer(containerId) {
  return new Promise((resolve, reject) => {
    const cmd = `docker rm -f ${containerId}`;  // <- critical fix
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`🔴 Docker Remove Error:`, error.message);
        console.error(`🔴 Remove Stderr:`, stderr);
        return reject(new Error(stderr || error.message));
      }
      console.log(`✅ Container ${containerId} removed successfully.`);
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