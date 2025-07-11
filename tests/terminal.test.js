// tests/terminal.test.js
const request = require('supertest');
const { app, server } = require('../server'); // CRITICAL: Correctly import app and server
const Session = require('../app/models/session.model'); // Adjust path if needed

describe('API /api/terminal', () => {
  let testContainerId;

  const TEST_USER_ID = 'testuser-terminal';
  const TEST_IMAGE_NAME = 'testuser-image';
  const TEST_LOCAL_PATH = '/Users/imsnmn/madcampweek2-backend/cloned-repo'; // Verify this path

  // No need for jest.setTimeout here if set globally.

  beforeAll(async () => {
    console.log('✅ [beforeAll] Cleaning old test sessions...');
    // MongoDB is already connected by globalSetup.js
    await Session.deleteMany({ user_id: TEST_USER_ID });

    console.log('✅ [beforeAll] Creating test container...');
    // The `build-run` endpoint in your controller calls dockerManager.buildImage(localPath, imageName).
    // Ensure the `send` payload matches the controller's expectation.
    const buildRes = await request(app)
      .post('/api/session/build-run')
      .send({
        user_id: TEST_USER_ID,
        localPath: TEST_LOCAL_PATH, // This is `localPath` argument to buildImage
        imageName: TEST_IMAGE_NAME, // This is `imageName` argument to buildImage
        resources: {
          cpu: '0.5',
          memory: '200MB'
        }
      });

    if (buildRes.statusCode !== 200) {
      console.error(`🔴 Failed to build and run container in beforeAll: Status ${buildRes.statusCode}`, buildRes.body);
      throw new Error(`Container creation failed with status: ${buildRes.statusCode}. Error: ${JSON.stringify(buildRes.body)}`);
    }

    expect(buildRes.statusCode).toBe(200);
    expect(buildRes.body).toHaveProperty('containerId');
    testContainerId = buildRes.body.containerId;
    console.log(`✅ Created test container: ${testContainerId}`);

    // Add a delay to ensure the container is fully running and services within it are up
    console.log('⏳ Waiting for container to fully start...');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds (adjust as needed)
    console.log('✅ Container wait complete.');

  }, 60000); // Increased timeout for beforeAll due to Docker ops

  afterAll(async () => {
    console.log('✅ [afterAll] Cleaning up...');
    if (testContainerId) {
      try {
        // Use the remove endpoint to clean up the container and DB session
        const removeRes = await request(app).delete(`/api/session/remove/${testContainerId}`);
        if (removeRes.statusCode !== 200) {
             console.error(`🔴 Error during container cleanup (remove ${testContainerId}): Status ${removeRes.statusCode}`, removeRes.body);
        } else {
            console.log(`✅ Removed test container: ${testContainerId}`);
        }
      } catch (error) {
        console.error(`🔴 Exception during container cleanup (remove ${testContainerId}):`, error.message);
      }
    }
    // Final DB cleanup for safety, although the remove endpoint should handle it.
    await Session.deleteMany({ user_id: TEST_USER_ID });
    console.log('✅ Database sessions cleaned.');

    // --- CRITICAL FIX: Close the Express server ---
    await new Promise(resolve => {
      if (server && server.listening) {
        console.log('⏳ Closing Express server...');
        server.close(() => {
          console.log('✅ Express server closed.');
          resolve();
        });
      } else {
        console.warn('⚠️ Express server instance not found or not listening for closing.');
        resolve();
      }
    });
  }, 40000); // Keep or adjust timeout

  // ... (rest of your 'it' blocks)

  it('should execute command in container', async () => {
    console.log('🟣 [Test] Executing ls -la in container');
    const res = await request(app)
      .post('/api/terminal/execute')
      .send({
        containerId: testContainerId,
        command: 'ls -la'
      });

    if (res.statusCode !== 200) {
        console.error(`🔴 execute command failed with status ${res.statusCode}:`, res.body);
    }
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('result');
    expect(res.body.result.length).toBeGreaterThan(0); // Expect some output
    console.log('✅ Command Result (snippet):', res.body.result.substring(0, 100) + '...');
  }, 20000);

  it('should run git command in container', async () => {
    console.log('🟣 [Test] Running git --version in container');
    const res = await request(app)
      .post('/api/terminal/git')
      .send({
        containerId: testContainerId,
        gitCmd: 'git --version'
      });

    if (res.statusCode !== 200) {
        console.error(`🔴 git command failed with status ${res.statusCode}:`, res.body);
    }
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('result');
    expect(res.body.result).toContain('git version'); // Expect git version output
    console.log('✅ Git Result:', res.body.result.trim());
  }, 20000);

  it('should add SSH key in container', async () => {
    console.log('🟣 [Test] Adding SSH Key to container');
    const fakeKey = `-----BEGIN RSA PRIVATE KEY-----
FAKE_LINE_1_OF_KEY
FAKE_LINE_2_OF_KEY
-----END RSA PRIVATE KEY-----`;

    const res = await request(app)
      .post('/api/terminal/ssh-key')
      .send({
        containerId: testContainerId,
        privateKey: fakeKey
      });

    if (res.statusCode !== 200) {
        console.error(`🔴 SSH key add failed with status ${res.statusCode}:`, res.body);
    }
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'SSH Key added successfully');
    console.log('✅ SSH Key Added Successfully');
  }, 20000);
});