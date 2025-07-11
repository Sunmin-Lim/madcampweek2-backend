// tests/session.test.js
const request = require('supertest');
const { app, server } = require('../server');
const Session = require('../app/models/session.model');

describe('API /api/session', () => {
  let createdContainerId;
  let createdSessionId;

  const TEST_USER_ID = 'testuser-session';
  const TEST_IMAGE_NAME = 'testuser-image';
  const TEST_LOCAL_PATH = '/Users/imsnmn/madcampweek2-backend/cloned-repo';

  beforeAll(async () => {
    console.log('✅ [beforeAll] Cleaning ALL sessions...');
    await Session.deleteMany({ user_id: TEST_USER_ID });

    console.log('🟣 [beforeAll] Creating Docker container...');
    const res = await request(app)
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

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('containerId');

    createdContainerId = res.body.containerId;
    console.log(`✅ Created Container ID: ${createdContainerId}`);

    // Give time for DB to register
    await new Promise(r => setTimeout(r, 1000));
    const sessions = await Session.find({ user_id: TEST_USER_ID });
    console.log('✅ DB Sessions after creation:', sessions);

    expect(sessions.length).toBe(1);
    expect(sessions[0].container_id).toBe(createdContainerId);
    createdSessionId = sessions[0]._id.toString();
  }, 60000);

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
  }, 40000);

  it('should get session list for user', async () => {
    console.log('🟣 [Test] Getting session list...');
    const res = await request(app)
      .get(`/api/session?user_id=${TEST_USER_ID}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].user_id).toBe(TEST_USER_ID);
    expect(res.body[0].status).toBe('RUNNING');
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

  it('should stop the container and update session', async () => {
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

    await new Promise(r => setTimeout(r, 500));
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
    expect(removedSession).toBeNull();
  }, 20000);
});
