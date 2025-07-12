  //const TEST_LOCAL_PATH = '/Users/imsnmn/madcampweek2-backend/welcome-to-docker';
 //const TEST_LOCAL_PATH = '/home/hanjeongjin/Workspace_ubuntu/backend/madcampweek2-backend/cloned-repo';

const request = require('supertest');
const { app, server } = require('../server');
const Session = require('../app/models/session.model');
const fs = require('fs');
require('dotenv').config();

const TEST_USER_ID = 'testuser-session';
const TEST_IMAGE_NAME = 'testuser-image';
const TEST_LOCAL_PATH = process.env.TEST_LOCAL_PATH || '/Users/imsnmn/madcampweek2-backend/welcome-to-docker';

if (!fs.existsSync(TEST_LOCAL_PATH)) {
  throw new Error(`❌ TEST_LOCAL_PATH does not exist: ${TEST_LOCAL_PATH}`);
}

describe('API /api/session', () => {
  let createdContainerId;
  let createdSessionId;

  beforeAll(async () => {
    await Session.deleteMany({ user_id: TEST_USER_ID });

    const res = await request(app)
      .post('/api/session/build-run')
      .send({
        user_id: TEST_USER_ID,
        localPath: TEST_LOCAL_PATH,
        imageName: TEST_IMAGE_NAME,
        resources: { cpu: '0.5', memory: '200MB' }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('containerId');

    createdContainerId = res.body.containerId;

    await new Promise(r => setTimeout(r, 1000));
    const sessions = await Session.find({ user_id: TEST_USER_ID });
    expect(sessions.length).toBe(1);
    createdSessionId = sessions[0]._id.toString();
  }, 60000);

  afterAll(async () => {
    await Session.deleteMany({ user_id: TEST_USER_ID });
    if (server && server.close) {
      await new Promise(resolve => server.close(resolve));
    }
  }, 40000);

  it('should get session list for user', async () => {
    const res = await request(app).get(`/api/session?user_id=${TEST_USER_ID}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 15000);

  it('should get container status', async () => {
    const res = await request(app).get(`/api/session/status/${createdContainerId}`);
    if (res.statusCode === 404) return;
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
  }, 15000);

  it('should stop the container and update session', async () => {
    if (!createdContainerId || !createdSessionId) return;

    const res = await request(app)
      .post('/api/session/stop')
      .send({ containerId: createdContainerId, sessionId: createdSessionId });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Container stopped');

    await new Promise(r => setTimeout(r, 500));
    const updated = await Session.findById(createdSessionId);
    expect(updated).not.toBeNull();
    expect(updated.status).toBe('STOPPED');
  }, 20000);

  it('should remove the container', async () => {
    if (!createdContainerId) return;

    const res = await request(app).delete(`/api/session/remove/${createdContainerId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Container removed');

    await new Promise(r => setTimeout(r, 500));
    const removedSession = await Session.findById(createdSessionId);
    expect(removedSession).toBeNull();
  }, 20000);
});
