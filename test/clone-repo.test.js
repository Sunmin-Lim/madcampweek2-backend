// const request = require('supertest');
// const app = require('../server');  // server.js 파일을 임포트하여 Express 앱 객체 가져오기
// const User = require('../models/User');
// const generateToken = require('./test-utils'); // JWT 토큰 생성 함수

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

//   afterAll(async () => {
//     await User.deleteMany({});
//   });

//   it('should clone the repo and save to user clonedRepos', async () => {
//     // const repoUrl = 'https://github.com/testuser/test-repo.git';
//     const repoUrl = 'https://github.com/docker/welcome-to-docker.git';  // 실제 존재하는 Git 리포지토리로 수정


//     const response = await request(app)
//       .post('/api/gitController/clone-repo')  // 경로 수정: /api/gitController/clone-repo로 요청
//       .set('Authorization', `Bearer ${token}`)
//       .send({ repoUrl });

//     expect(response.status).toBe(200);
//     expect(response.body.message).toBe('Git 리포지토리 클론 성공');
//     expect(response.body.clonedRepos).toContain(repoUrl); // 사용자 클론된 리포지토리 배열에 URL 포함 확인
//   });

//   it('should return error if repoUrl is missing', async () => {
//     const response = await request(app)
//       .post('/api/gitController/clone-repo')  // 경로 수정
//       .set('Authorization', `Bearer ${token}`)
//       .send({}); // repoUrl 없이 요청

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('리포지토리 URL이 필요합니다.');
//   });

//   it('should return error if repo already exists', async () => {
//     // const repoUrl = 'https://github.com/testuser/existing-repo.git';
//     const repoUrl = 'https://github.com/docker/welcome-to-docker.git';  // 실제 존재하는 Git 리포지토리로 수정


//     await request(app)
//       .post('/api/gitController/clone-repo')  // 경로 수정
//       .set('Authorization', `Bearer ${token}`)
//       .send({ repoUrl });

//     const response = await request(app)
//       .post('/api/gitController/clone-repo')  // 경로 수정
//       .set('Authorization', `Bearer ${token}`)
//       .send({ repoUrl });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe("'welcome-to-docker' 디렉토리가 이미 존재합니다.");
//   });
// });


const request = require('supertest');
const app = require('../server');  // server.js 파일을 임포트하여 Express 앱 객체 가져오기
const User = require('../models/User');
const generateToken = require('./test-utils'); // JWT 토큰 생성 함수

describe('POST /clone-repo', () => {
  let token;
  let user;

  beforeAll(async () => {
    // 테스트용 사용자 생성
    user = await User.create({
      email: 'testuser@example.com',
      password_hash: 'hashedpassword',
      username: 'testuser',
    });

    // 사용자 토큰 생성
    token = generateToken(user._id);
  });

  afterAll(async () => {
    // 테스트 후 사용자 삭제
    await User.deleteMany({});
  });

  it('should clone the repo and save to user clonedRepos', async () => {
    const repoUrl = 'https://github.com/docker/welcome-to-docker.git';  // 실제 존재하는 Git 리포지토리로 수정

    const response = await request(app)
      .post('/api/gitController/clone-repo')  // 경로 수정: /api/gitController/clone-repo로 요청
      .set('Authorization', `Bearer ${token}`)
      .send({ repoUrl });

    // 응답 검증
    expect(response.status).toBe(200);  // 성공적으로 200 상태 코드를 반환해야 함
    expect(response.body.message).toBe('Git 리포지토리 클론 성공');  // 메시지 검증
    expect(response.body.clonedRepos).toContain(repoUrl); // 사용자 클론된 리포지토리 배열에 URL 포함 확인
  });

  it('should return error if repoUrl is missing', async () => {
    const response = await request(app)
      .post('/api/gitController/clone-repo')  // 경로 수정
      .set('Authorization', `Bearer ${token}`)
      .send({}); // repoUrl 없이 요청

    expect(response.status).toBe(400);  // 400 상태 코드 검증
    expect(response.body.message).toBe('리포지토리 URL이 필요합니다.');  // URL이 없을 때 에러 메시지 검증
  });

  it('should return error if repo already exists', async () => {
    const repoUrl = 'https://github.com/docker/welcome-to-docker.git';  // 이미 존재하는 리포지토리 URL 사용

    // 리포지토리 클론 시도
    await request(app)
      .post('/api/gitController/clone-repo')  // 경로 수정
      .set('Authorization', `Bearer ${token}`)
      .send({ repoUrl });

    // 이미 클론된 리포지토리를 다시 클론하려 할 때
    const response = await request(app)
      .post('/api/gitController/clone-repo')  // 경로 수정
      .set('Authorization', `Bearer ${token}`)
      .send({ repoUrl });

    // 이미 존재하는 디렉토리일 때 400 상태 코드 반환 확인
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("'welcome-to-docker' 디렉토리가 이미 존재합니다.");
  });
});
