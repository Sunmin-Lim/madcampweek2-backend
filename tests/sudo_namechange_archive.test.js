const request = require('supertest');
const { app, server } = require('../server'); // 서버 파일을 import -> dotenv 

// SUDO_NAME과 SUDO_SECRET을 환경 변수에서 가져옵니다.
const sudoName = process.env.SUDO_NAME;
const sudoSecret = process.env.SUDO_SECRET;

describe('GET /api/sudo_archive/current-user', () => {
  it('should return the current user from /api/sudo_archive/current-user', async () => {
    // 1. 최초로 현재 사용자 확인
    const initialRes = await request(app)
      .get('/api/sudo_archive/current-user')  // 현재 사용자 정보 API 경로
      .expect('Content-Type', /json/)
      .expect(200);  // 예상 응답 코드: 200 OK

    // 최초 응답 검증
    expect(initialRes.body).toHaveProperty('message', 'Current user fetched successfully');
    expect(initialRes.body).toHaveProperty('user');
    expect(initialRes.body.user).toBeDefined();
    console.log(`DEBUG: Initial current user is: ${initialRes.body.user}`); // Debug 로그로 사용자 확인
  }, 20000);
});

describe('POST /api/sudo_archive/change-user', () => {
  it('should change the current user to another user', async () => {
    // 2. 사용자 변경 요청
    const changeRes = await request(app)
      .post('/api/sudo_archive/change-user')  // 사용자 변경 API 경로
      .send({
        user_name: sudoName,  // 전환할 사용자 이름
        user_password: sudoSecret // 해당 사용자 비밀번호
      })
      .expect('Content-Type', /json/)
      .expect(200);  // 예상 응답 코드: 200 OK

    console.log(`DEBUG: Change user response: ${JSON.stringify(changeRes.body, null, 2)}`);

    // 응답 검증
    expect(changeRes.body).toHaveProperty('message', 'User changed successfully');
    expect(changeRes.body).toHaveProperty('user');
    expect(changeRes.body.user).toBeDefined();
    expect(changeRes.body.user).toBe('backoverflow');  // 'backoverflow'으로 사용자 변경되어야 함
  });
});

describe('GET /api/sudo_archive/current-user after user change', () => {
  it('should return the changed user from /api/sudo_archive/current-user', async () => {
    // 3. 사용자 변경 후 다시 현재 사용자 확인
    const afterChangeRes = await request(app)
      .get('/api/sudo_archive/current-user')  // 현재 사용자 정보 API 경로
      .expect('Content-Type', /json/)
      .expect(200);  // 예상 응답 코드: 200 OK

    // 변경된 사용자 확인
    expect(afterChangeRes.body).toHaveProperty('message', 'Current user fetched successfully');
    expect(afterChangeRes.body).toHaveProperty('user');
    expect(afterChangeRes.body.user).toBeDefined();
    console.log(`DEBUG: Current user after change is: ${afterChangeRes.body.user}`); // Debug 로그로 사용자 확인
    expect(afterChangeRes.body.user).toBe('hanjeongjin');  // 'hanjeongjin'으로 변경된 사용자가 반환되어야 함
  }, 20000);
});
