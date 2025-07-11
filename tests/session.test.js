// tests/session.test.js
const request = require('supertest');
const { app, server } = require('../server'); // CRITICAL: Correctly import app and server
const Session = require('../app/models/session.model'); // Adjust path

describe('API /api/session', () => {
  let createdContainerId;
  let createdSessionId;

  const TEST_USER_ID = 'testuser';
  const TEST_IMAGE_NAME = 'testuser-image';
  const TEST_LOCAL_PATH = '/Users/imsnmn/madcampweek2-backend/cloned-repo'; // Verify this path

  // No need for jest.setTimeout here if set globally in jest.config.js,
  // unless you need a different default for this specific suite.

  beforeAll(async () => {
    console.log('✅ [beforeAll] Cleaning old test sessions for this user...');
    // MongoDB is already connected by globalSetup.js
    await Session.deleteMany({ user_id: TEST_USER_ID });
  });

  afterAll(async () => {
    console.log('✅ [afterAll] Cleaning up test DB for this user...');
    await Session.deleteMany({ user_id: TEST_USER_ID }); // Ensure clean after all tests in suite

    // --- CRITICAL FIX: Close the Express server ---
    await new Promise(resolve => {
      // Check if server exists and is actively listening (has open connections)
      if (server && server.listening) {
        console.log('⏳ Closing Express server...');
        server.close(() => {
          console.log('✅ Express server closed.');
          resolve();
        });
      } else {
        console.warn('⚠️ Express server instance not found or not listening for closing.');
        resolve(); // Still resolve the promise to allow Jest to continue
      }
    });

    // MongoDB connection is handled by globalTeardown.js, so no close here.
  }, 40000); // Give afterAll enough time for Docker cleanup and server close

  it('should create a Docker container AND save session in DB', async () => {
    console.log('🟣 [Test] Creating Docker container...');
    const res = await request(app) // `app` is now the correct Express instance for supertest
      .post('/api/session/build-run')
      .send({
        user_id: TEST_USER_ID,
        localPath: TEST_LOCAL_PATH,
        imageName: TEST_IMAGE_NAME,
        resources: {
          cpu: '0.5',
          memory: '200MB'
        }
      })
      .set('Accept', 'application/json');

    if (res.statusCode !== 200) {
      console.error(`🔴 build-run failed with status ${res.statusCode}:`, res.body);
    }
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('containerId');
    createdContainerId = res.body.containerId;

    console.log(`✅ Created Container ID: ${createdContainerId}`);

    // Add a short delay to allow the DB save operation (which is async in your controller)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for DB consistency

    // ✅ DB 확인
    const sessions = await Session.find({ user_id: TEST_USER_ID });
    console.log('✅ DB Sessions:', sessions);
    expect(sessions.length).toBe(1); // Expect 1 if global and beforeAll cleanup worked
    expect(sessions[0].container_id).toBe(createdContainerId);
    createdSessionId = sessions[0]._id.toString();
  }, 60000); // Explicitly set a longer timeout for this test as it involves Docker build/run

  it('should get session list for user', async () => {
    console.log('🟣 [Test] Getting session list...');
    const res = await request(app)
      .get(`/api/session?user_id=${TEST_USER_ID}`);

    if (res.statusCode !== 200) {
        console.error(`🔴 get session list failed with status ${res.statusCode}:`, res.body);
    }
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0); // Ensure at least one session is returned
    expect(res.body[0].user_id).toBe(TEST_USER_ID);
    expect(res.body[0].status).toBe('RUNNING'); // Expecting the status to be 'RUNNING' initially
  }, 15000);

  it('should get container status', async () => {
    console.log('🟣 [Test] Getting container status...');
    const res = await request(app)
      .get(`/api/session/status/${createdContainerId}`);

    if (res.statusCode !== 200) {
        console.error(`🔴 getContainerStatus failed with status ${res.statusCode}:`, res.body);
    }
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('running'); // Expect 'running' (Docker's standard output)
  }, 15000);

  it('should stop the container and update session', async () => {
    console.log('🟣 [Test] Stopping container...');
    const res = await request(app)
      .post('/api/session/stop')
      .send({
        containerId: createdContainerId,
        sessionId: createdSessionId
      });

    if (res.statusCode !== 200) {
        console.error(`🔴 stopContainer failed with status ${res.statusCode}:`, res.body);
    }
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Container stopped');

    await new Promise(resolve => setTimeout(resolve, 500)); // Small wait for DB update to propagate

    // ✅ DB 상태 확인
    const updated = await Session.findById(createdSessionId);
    expect(updated).not.toBeNull();
    expect(updated.status).toBe('STOPPED');
  }, 20000);

  it('should remove the container', async () => {
    console.log('🟣 [Test] Removing container...');
    const res = await request(app)
      .delete(`/api/session/remove/${createdContainerId}`);

    if (res.statusCode !== 200) {
        console.error(`🔴 removeContainer failed with status ${res.statusCode}:`, res.body);
    }
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Container removed');

    await new Promise(resolve => setTimeout(resolve, 500)); // Small wait for DB operation

    // ✅ DB 확인: Assuming your remove API also deletes the session from the DB
    const removedSession = await Session.findById(createdSessionId);
    expect(removedSession).toBeNull(); // If the session is removed from DB
  }, 20000);
});