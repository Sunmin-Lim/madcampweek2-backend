//   //const TEST_LOCAL_PATH = '/Users/imsnmn/madcampweek2-backend/welcome-to-docker';
//  //const TEST_LOCAL_PATH = '/home/hanjeongjin/Workspace_ubuntu/backend/madcampweek2-backend/cloned-repo';

// const request = require('supertest');
// const { app, server } = require('../server');
// const Session = require('../app/models/session.model');
// const fs = require('fs');
// require('dotenv').config();

// const TEST_USER_ID = 'testuser-session';
// const TEST_IMAGE_NAME = 'testuser-image';
// const TEST_LOCAL_PATH = process.env.TEST_LOCAL_PATH || '/Users/imsnmn/madcampweek2-backend/welcome-to-docker';

// if (!fs.existsSync(TEST_LOCAL_PATH)) {
//   throw new Error(`❌ TEST_LOCAL_PATH does not exist: ${TEST_LOCAL_PATH}`);
// }

// describe('API /api/session', () => {
//   let createdContainerId;
//   let createdSessionId;

//   beforeAll(async () => {
//     await Session.deleteMany({ user_id: TEST_USER_ID });

//     const res = await request(app)
//       .post('/api/session/build-run')
//       .send({
//         user_id: TEST_USER_ID,
//         localPath: TEST_LOCAL_PATH,
//         imageName: TEST_IMAGE_NAME,
//         resources: { cpu: '0.5', memory: '200MB' }
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('containerId');

//     createdContainerId = res.body.containerId;

//     await new Promise(r => setTimeout(r, 1000));
//     const sessions = await Session.find({ user_id: TEST_USER_ID });
//     expect(sessions.length).toBe(1);
//     createdSessionId = sessions[0]._id.toString();
//   }, 60000);

//   afterAll(async () => {
//     await Session.deleteMany({ user_id: TEST_USER_ID });
//     if (server && server.close) {
//       await new Promise(resolve => server.close(resolve));
//     }
//   }, 40000);

//   it('should get session list for user', async () => {
//     const res = await request(app).get(`/api/session?user_id=${TEST_USER_ID}`);
//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//   }, 15000);

//   it('should get container status', async () => {
//     const res = await request(app).get(`/api/session/status/${createdContainerId}`);
//     if (res.statusCode === 404) return;
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('status');
//   }, 15000);

//   it('should stop the container and update session', async () => {
//     if (!createdContainerId || !createdSessionId) return;

//     const res = await request(app)
//       .post('/api/session/stop')
//       .send({ containerId: createdContainerId, sessionId: createdSessionId });

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('message', 'Container stopped');

//     await new Promise(r => setTimeout(r, 500));
//     const updated = await Session.findById(createdSessionId);
//     expect(updated).not.toBeNull();
//     expect(updated.status).toBe('STOPPED');
//   }, 20000);

//   it('should remove the container', async () => {
//     if (!createdContainerId) return;

//     const res = await request(app).delete(`/api/session/remove/${createdContainerId}`);
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('message', 'Container removed');

//     await new Promise(r => setTimeout(r, 500));
//     const removedSession = await Session.findById(createdSessionId);
//     expect(removedSession).toBeNull();
//   }, 20000);
// });



// tests/session.test.js
const request = require('supertest');
const { app, server } = require('../server');
const Session = require('../app/models/session.model');

describe('API /api/session', () => {
  let createdContainerId;
  let createdSessionId;

  const TEST_USER_ID = 'testuser-session';
  const TEST_IMAGE_NAME = 'testuser-image';
  const TEST_LOCAL_PATH = '/home/hanjeongjin/Workspace_ubuntu/backend/madcampweek2-backend/cloned-repo';

  beforeAll(async () => {
    console.log('✅ [beforeAll] Cleaning ALL sessions...');
    await Session.deleteMany({ user_id: TEST_USER_ID });

    console.log('🟣 [beforeAll] Building Docker image...');
    // Step 1: Build the Docker image
    const buildRes = await request(app)
      .post('/api/session/build')  // Use the build endpoint
      .send({
        user_id: TEST_USER_ID,
        localPath: TEST_LOCAL_PATH,
        imageName: TEST_IMAGE_NAME,
      })
      .set('Accept', 'application/json');

    // Validate the response after build
    expect(buildRes.statusCode).toBe(200);
    expect(buildRes.body).toHaveProperty('sessionId');
    createdSessionId = buildRes.body.sessionId; // Store the session ID for future use
    console.log(`✅ Built session ID: ${createdSessionId}`);

    // Give time for DB to register
    await new Promise(r => setTimeout(r, 1000));

    const sessions = await Session.find({ user_id: TEST_USER_ID });
    console.log('✅ DB Sessions after build:', sessions);

    expect(sessions.length).toBe(1);
    expect(sessions[0].image_name).toBe(TEST_IMAGE_NAME);
    createdContainerId = sessions[0].container_id; // Initially container_id should be null
    expect(createdContainerId).toBeNull();
  }, 60000);  // Increased timeout for Docker build

  afterAll(async () => {
    console.log('✅ [afterAll] Final DB cleanup...');
    await Session.deleteMany({ user_id: TEST_USER_ID });

    await new Promise(resolve => {
      if (server && server.listening) {
        server.close(() => {
          console.log('✅ Express server closed.');
          resolve();
        });
      } else {
        console.warn('⚠️ Express server not found or not listening.');
        resolve();
      }
    });
  }, 40000); // Increased timeout for server shutdown

  it('should get session list for user', async () => {
    console.log('🟣 [Test] Getting session list...');
    const res = await request(app)
      .get(`/api/session/get?user_id=${TEST_USER_ID}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].user_id).toBe(TEST_USER_ID);
    expect(res.body[0].status).toBe('BUILT');  // Check if status is 'BUILT' after the build
  }, 15000);

  it('should run the container and update session status', async () => {
    console.log('🟣 [Test] Running container...');
    // Step 2: Run the container using the sessionId

    // Define cpu, memory, and port values
    const cpu = '0.5';  // Example CPU allocation
    const memory = '200MB';  // Example memory allocation
    const port = '8080:80';  // Example port

    const runRes = await request(app)
      .post('/api/domain/run')  // Use the domain route for running containers
      .send({
        session_id: createdSessionId, 
        
        cpu, memory, port// Pass the session ID to run the container
      });

    console.log('Response Status Code:', runRes.statusCode);  // Log status code for debugging
    console.log('Response Body:', runRes.body);  // Log response body for debugging

    // Check the response
    expect(runRes.statusCode).toBe(200);
    expect(runRes.body).toHaveProperty('containerId');
    expect(runRes.body.containerId).not.toBeNull();
    createdContainerId = runRes.body.containerId; // Store the container ID after it's run

    // Get the session and verify status is 'RUNNING'
    const updatedSession = await Session.findById(createdSessionId);
    expect(updatedSession.status).toBe('RUNNING');
  }, 15000);

  it('should get container status', async () => {
    console.log('🟣 [Test] Getting container status...');
    const res = await request(app)
      .get(`/api/session/status/${createdContainerId}`);

    if (res.statusCode === 404) {
      console.warn('⚠️ Container might not exist anymore. Skipping status check.');
      return;
    }

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(['running', 'exited', 'not_found']).toContain(res.body.status);
  }, 15000);

  it('should stop the container and update session status to STOPPED', async () => {
    console.log('🟣 [Test] Stopping container...');
    if (!createdContainerId || !createdSessionId) {
      console.warn('⚠️ No container/session ID available. Skipping.');
      return;
    }

    const res = await request(app)
      .post('/api/session/stop')
      .send({
        containerId: createdContainerId,
        sessionId: createdSessionId
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Container stopped');

    await new Promise(r => setTimeout(r, 500));  // Give some time for DB to update

    const updated = await Session.findById(createdSessionId);
    expect(updated).not.toBeNull();
    expect(updated.status).toBe('STOPPED');
  }, 20000);

  it('should remove the container', async () => {
    console.log('🟣 [Test] Removing container...');
    if (!createdContainerId) {
      console.warn('⚠️ No container ID available. Skipping.');
      return;
    }

    const res = await request(app)
      .delete(`/api/session/remove/${createdContainerId}`);

    if (res.statusCode !== 200) {
      console.error('⚠️ Could not remove container. Status:', res.statusCode, res.body);
    }

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Container removed');

    await new Promise(r => setTimeout(r, 500));
    const removedSession = await Session.findById(createdSessionId);
    expect(removedSession).toBeNull();  // Verify the session is removed
  }, 20000);
});