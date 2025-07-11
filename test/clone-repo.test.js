const request = require('supertest');
const { app, server } = require('../server');
const User = require('../models/User');
const generateToken = require('./test-utils');
const fs = require('fs-extra');
const path = require('path');

const BASE_CLONE_PATH = path.resolve('F:/workspace/server_manage/home/testuser');

describe('POST /clone-repo', () => {
  let token;
  let user;

  beforeAll(async () => {
    user = await User.create({
      email: 'testuser@example.com',
      password_hash: 'hashedpassword',
      username: 'testuser',
    });
    token = generateToken(user._id);
  });

  beforeEach(() => {
    if (fs.existsSync(BASE_CLONE_PATH)) {
      fs.removeSync(BASE_CLONE_PATH);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    if (fs.existsSync(BASE_CLONE_PATH)) {
      fs.removeSync(BASE_CLONE_PATH);
    }
    if (server && server.close) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  it('should clone the repo and save to user clonedRepos', async () => {
    const repoUrl = 'https://github.com/docker/welcome-to-docker.git';
    const res = await request(app)
      .post('/api/gitController/clone-repo')
      .set('Authorization', `Bearer ${token}`)
      .send({ repoUrl });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Git 리포지토리 클론 성공');
    expect(res.body.clonedRepos).toContain(repoUrl);
  });

  it('should return error if repoUrl is missing', async () => {
    const res = await request(app)
      .post('/api/gitController/clone-repo')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('리포지토리 URL이 필요합니다.');
  });

  it('should return error if repo already exists', async () => {
    const repoUrl = 'https://github.com/docker/welcome-to-docker.git';

    await request(app)
      .post('/api/gitController/clone-repo')
      .set('Authorization', `Bearer ${token}`)
      .send({ repoUrl });

    const res = await request(app)
      .post('/api/gitController/clone-repo')
      .set('Authorization', `Bearer ${token}`)
      .send({ repoUrl });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("'welcome-to-docker' 디렉토리가 이미 존재합니다.");
  });
});
