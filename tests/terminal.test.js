  //const TEST_LOCAL_PATH = '/Users/imsnmn/madcampweek2-backend/welcome-to-docker';
 //const TEST_LOCAL_PATH = '/home/hanjeongjin/Workspace_ubuntu/backend/madcampweek2-backend/cloned-repo';

const request = require('supertest');
const { app, server } = require('../server');
const Session = require('../app/models/session.model');
const fs = require('fs');
require('dotenv').config();

const TEST_USER_ID = 'testuser-terminal';
const TEST_IMAGE_NAME = 'testuser-image';
const TEST_LOCAL_PATH = process.env.TEST_LOCAL_PATH || '/Users/imsnmn/madcampweek2-backend/welcome-to-docker';

if (!fs.existsSync(TEST_LOCAL_PATH)) {
  throw new Error(`❌ TEST_LOCAL_PATH does not exist: ${TEST_LOCAL_PATH}`);
}

describe('API /api/terminal', () => {
  let testContainerId;

  beforeAll(async () => {
    await Session.deleteMany({ user_id: TEST_USER_ID });

    const buildRes = await request(app)
      .post('/api/session/build-run')
      .send({
        user_id: TEST_USER_ID,
        localPath: TEST_LOCAL_PATH,
        imageName: TEST_IMAGE_NAME,
        resources: { cpu: '0.5', memory: '200MB' }
      });

    expect(buildRes.statusCode).toBe(200);
    testContainerId = buildRes.body.containerId;

    await new Promise(resolve => setTimeout(resolve, 5000));
  }, 60000);

  afterAll(async () => {
    if (testContainerId) {
      await request(app).delete(`/api/session/remove/${testContainerId}`);
    }
    await Session.deleteMany({ user_id: TEST_USER_ID });
    if (server && server.close) {
      await new Promise(resolve => server.close(resolve));
    }
  }, 40000);

  it('should execute command in container', async () => {
    const res = await request(app)
      .post('/api/terminal/execute')
      .send({
        containerId: testContainerId,
        command: 'ls -la'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('result');
  }, 20000);

  it('should run git command in container', async () => {
    const res = await request(app)
      .post('/api/terminal/git')
      .send({
        containerId: testContainerId,
        gitCmd: 'git --version'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toContain('git version');
  }, 20000);

  it('should add SSH key in container', async () => {
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

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('SSH Key added successfully');
  }, 20000);
});
