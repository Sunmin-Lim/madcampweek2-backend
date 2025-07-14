const request = require('supertest');
const { app, server } = require('../server'); // 서버 파일을 import -> dotenv

// Get SUDO_NAME and SUDO_SECRET from environment variables
const sudoName = process.env.SUDO_NAME;
const sudoSecret = process.env.SUDO_SECRET;

describe('POST /api/sudo_archive/add', () => {
  it('should add a new user', async () => {
    // user_name, user_password, user_repos
    const newUser = {
      user_name: 'dev_user15',  // 사용자 이름 dev_user2
      user_password: '12341234',  // 비밀번호
      user_repo_url: 'https://github.com/Jeong-jin-Han/welcome-to-docker_test.git'  // 레포지토리 링크
    };

    const res = await request(app)
      .post('/api/sudo_archive/add')
      .send(newUser)
      .expect('Content-Type', /json/)
      .expect(200);  // 예상 응답 코드: 200 OK

    // 응답 검증
    expect(res.body).toHaveProperty('message', 'User added and repositories configured.');
    console.log(`DEBUG: Add user response: ${JSON.stringify(res.body, null, 2)}`);
  });
});

// describe('POST /api/sudo_archive/delete', () => {
//   it('should delete a user', async () => {
//     const res = await request(app)
//       .post('/api/sudo_archive/delete')
//       .send({
//         user_name: 'dev_user2'  // 삭제할 사용자
//       })
//       .expect('Content-Type', /json/)
//       .expect(200);  // 예상 응답 코드: 200 OK

//     // 응답 검증
//     expect(res.body).toHaveProperty('message', 'User deleted successfully.');
//     console.log(`DEBUG: Delete user response: ${JSON.stringify(res.body, null, 2)}`);
//   });
// });

describe('POST /api/sudo_archive/push', () => {
  it('should push changes to the archive', async () => {
    const res = await request(app)
      .post('/api/sudo_archive/push')
      .send({
        user_name: 'dev_user15'  // 푸시할 사용자
      })
      .expect('Content-Type', /json/)
      .expect(200);  // 예상 응답 코드: 200 OK

    // 응답 검증
    expect(res.body).toHaveProperty('message', 'Changes pushed to archive.');
    console.log(`DEBUG: Push to archive response: ${JSON.stringify(res.body, null, 2)}`);
  });
});
