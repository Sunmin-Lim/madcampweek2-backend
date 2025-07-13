// const request = require('supertest');
// const { app, server } = require('../server');
// const User = require('../models/User');
// const generateToken = require('./test-utils');
// const fs = require('fs-extra');
// const path = require('path');

// const BASE_CLONE_PATH = path.resolve('F:/workspace/server_manage/home/testuser');

// describe('POST /clone-repo', () => {
//   let token;
//   let user;

//   beforeAll(async () => {
//     user = await User.create({
//       email: 'testuser@example.com',
//       password_hash: 'hashedpassword',
//       username: 'testuser',
//     });
//     token = generateToken(user._id);
//   });

//   beforeEach(() => {
//     if (fs.existsSync(BASE_CLONE_PATH)) {
//       fs.removeSync(BASE_CLONE_PATH);
//     }
//   });

//   afterAll(async () => {
//     await User.deleteMany({});
//     if (fs.existsSync(BASE_CLONE_PATH)) {
//       fs.removeSync(BASE_CLONE_PATH);
//     }
//     if (server && server.close) {
//       await new Promise(resolve => server.close(resolve));
//     }
//   });

//   it('should clone the repo and save to user clonedRepos', async () => {
//     const repoUrl = 'https://github.com/docker/welcome-to-docker.git';
//     const res = await request(app)
//       .post('/api/gitController/clone-repo')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ repoUrl });

//     expect(res.status).toBe(200);
//     expect(res.body.message).toBe('Git 리포지토리 클론 성공');
//     expect(res.body.clonedRepos).toContain(repoUrl);
//   });

//   it('should return error if repoUrl is missing', async () => {
//     const res = await request(app)
//       .post('/api/gitController/clone-repo')
//       .set('Authorization', `Bearer ${token}`)
//       .send({});

//     expect(res.status).toBe(400);
//     expect(res.body.message).toBe('리포지토리 URL이 필요합니다.');
//   });

//   it('should return error if repo already exists', async () => {
//     const repoUrl = 'https://github.com/docker/welcome-to-docker.git';

//     await request(app)
//       .post('/api/gitController/clone-repo')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ repoUrl });

//     const res = await request(app)
//       .post('/api/gitController/clone-repo')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ repoUrl });

//     expect(res.status).toBe(400);
//     expect(res.body.message).toBe("'welcome-to-docker' 디렉토리가 이미 존재합니다.");
//   });
// });


// tests/clone-repo.test.js
// tests/clone-repo.test.js
const request = require('supertest');
const { app, server } = require('../server');
const User = require('../models/User');
const generateToken = require('./test-utils');
const fs = require('fs-extra');
const path = require('path');

const BASE_CLONE_PATH = path.resolve('F:/workspace/server_manage/home/testuser');  // 클론할 기본 경로

describe('Git Clone API', () => {
  let token;
  let user;

  beforeAll(async () => {
    // 테스트용 사용자 생성
    user = await User.create({
      email: 'testuser@example.com',
      password_hash: 'hashedpassword',
      username: 'testuser',
    });
    token = generateToken(user._id); // JWT 토큰 생성
  });

  beforeEach(() => {
    // 클론 디렉토리가 이미 존재하면 삭제
    if (fs.existsSync(BASE_CLONE_PATH)) {
      fs.removeSync(BASE_CLONE_PATH);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});  // 테스트 후 사용자 삭제
    if (fs.existsSync(BASE_CLONE_PATH)) {
      fs.removeSync(BASE_CLONE_PATH);  // 테스트 후 클론된 디렉토리 삭제
    }
    if (server && server.close) {
      await new Promise(resolve => server.close(resolve));  // 서버 종료
    }
  });

  it('should clone two repositories and return them in the clonedRepos array', async () => {
    const repoUrl1 = 'https://github.com/docker/welcome-to-docker.git';
    const repoUrl2 = 'https://github.com/Jeong-jin-Han/welcome-to-docker_test.git';

    // 첫 번째 리포지토리 클론
    const res1 = await request(app)
      .post('/api/gitController/clone-repo')  // 실제 API 엔드포인트
      .set('Authorization', `Bearer ${token}`)
      .send({ repoUrl: repoUrl1 });

    expect(res1.status).toBe(200);
    expect(res1.body.message).toBe('Git 리포지토리 클론 성공');
    expect(res1.body.clonedRepos).toContain(repoUrl1);

    // 두 번째 리포지토리 클론
    const res2 = await request(app)
      .post('/api/gitController/clone-repo')
      .set('Authorization', `Bearer ${token}`)
      .send({ repoUrl: repoUrl2 });

    expect(res2.status).toBe(200);
    expect(res2.body.message).toBe('Git 리포지토리 클론 성공');
    expect(res2.body.clonedRepos).toContain(repoUrl2);

    // 클론된 리포지토리 목록 조회
    const res3 = await request(app)
      .get(`/api/gitController/cloned-repos/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res3.status).toBe(200);
    expect(res3.body.message).toBe('사용자의 클론된 리포지토리 목록');
    expect(res3.body.clonedRepos).toEqual([
      'https://github.com/docker/welcome-to-docker.git',
      'https://github.com/Jeong-jin-Han/welcome-to-docker_test.git',
    ]);
  });

  it('should return error if repoUrl is missing', async () => {
    const res = await request(app)
      .post('/api/gitController/clone-repo')
      .set('Authorization', `Bearer ${token}`)
      .send({});  // 빈 body

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('리포지토리 URL이 필요합니다.');
  });

  it('should return error if repo already exists', async () => {
    const repoUrl = 'https://github.com/docker/welcome-to-docker.git';

    // 첫 번째 리포지토리 클론
    await request(app)
      .post('/api/gitController/clone-repo')
      .set('Authorization', `Bearer ${token}`)
      .send({ repoUrl });

    // 두 번째 리포지토리 클론 시도 (같은 리포지토리 URL)
    const res = await request(app)
      .post('/api/gitController/clone-repo')
      .set('Authorization', `Bearer ${token}`)
      .send({ repoUrl });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("'welcome-to-docker' 디렉토리가 이미 존재합니다.");
  });
});
