//   //const TEST_LOCAL_PATH = '/Users/imsnmn/madcampweek2-backend/welcome-to-docker';
//  //const TEST_LOCAL_PATH = '/home/hanjeongjin/Workspace_ubuntu/backend/madcampweek2-backend/cloned-repo';

// const request = require('supertest');
// const { app, server } = require('../server');
// const Session = require('../app/models/session.model');
// const fs = require('fs');
// require('dotenv').config();

// const TEST_USER_ID = 'testuser-terminal';
// const TEST_IMAGE_NAME = 'testuser-image';
// // const TEST_LOCAL_PATH = process.env.TEST_LOCAL_PATH || '/Users/imsnmn/madcampweek2-backend/welcome-to-docker';

// const TEST_LOCAL_PATH = '/home/hanjeongjin/Workspace_ubuntu/backend/madcampweek2-backend/cloned-repo';


// if (!fs.existsSync(TEST_LOCAL_PATH)) {
//   throw new Error(`❌ TEST_LOCAL_PATH does not exist: ${TEST_LOCAL_PATH}`);
// }

// describe('API /api/terminal', () => {
//   let testContainerId;

//   beforeAll(async () => {
//     await Session.deleteMany({ user_id: TEST_USER_ID });

//     const buildRes = await request(app)
//       .post('/api/session/build-run')
//       .send({
//         user_id: TEST_USER_ID,
//         localPath: TEST_LOCAL_PATH,
//         imageName: TEST_IMAGE_NAME,
//         resources: { cpu: '0.5', memory: '200MB' }
//       });

//     expect(buildRes.statusCode).toBe(200);
//     testContainerId = buildRes.body.containerId;

//     await new Promise(resolve => setTimeout(resolve, 5000));
//   }, 60000);

//   afterAll(async () => {
//     if (testContainerId) {
//       await request(app).delete(`/api/session/remove/${testContainerId}`);
//     }
//     await Session.deleteMany({ user_id: TEST_USER_ID });
//     if (server && server.close) {
//       await new Promise(resolve => server.close(resolve));
//     }
//   }, 40000);

//   it('should execute command in container', async () => {
//     const res = await request(app)
//       .post('/api/terminal/execute')
//       .send({
//         containerId: testContainerId,
//         command: 'ls -la'
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('result');
//   }, 20000);

//   it('should run git command in container', async () => {
//     const res = await request(app)
//       .post('/api/terminal/git')
//       .send({
//         containerId: testContainerId,
//         gitCmd: 'git --version'
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.result).toContain('git version');
//   }, 20000);

//   it('should add SSH key in container', async () => {
//     const fakeKey = `-----BEGIN RSA PRIVATE KEY-----
// FAKE_LINE_1_OF_KEY
// FAKE_LINE_2_OF_KEY
// -----END RSA PRIVATE KEY-----`;

//     const res = await request(app)
//       .post('/api/terminal/ssh-key')
//       .send({
//         containerId: testContainerId,
//         privateKey: fakeKey
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.message).toBe('SSH Key added successfully');
//   }, 20000);
// });




  //const TEST_LOCAL_PATH = '/Users/imsnmn/madcampweek2-backend/welcome-to-docker';
 //const TEST_LOCAL_PATH = '/home/hanjeongjin/Workspace_ubuntu/backend/madcampweek2-backend/cloned-repo';

const request = require('supertest');
const { app, server } = require('../server');
const Session = require('../app/models/session.model');
const fs = require('fs');
require('dotenv').config();

const TEST_USER_ID = 'testuser-terminal';
const TEST_IMAGE_NAME = 'testuser-image';
// const TEST_LOCAL_PATH = process.env.TEST_LOCAL_PATH || '/Users/imsnmn/madcampweek2-backend/welcome-to-docker';

const TEST_LOCAL_PATH = '/home/hanjeongjin/Workspace_ubuntu/backend/madcampweek2-backend/cloned-repo';


if (!fs.existsSync(TEST_LOCAL_PATH)) {
  throw new Error(`❌ TEST_LOCAL_PATH does not exist: ${TEST_LOCAL_PATH}`);
}

describe('API /api/terminal', () => {
  let testContainerId;

  beforeAll(async () => {
    await Session.deleteMany({ user_id: TEST_USER_ID });

    // const buildRes = await request(app)
    //   .post('/api/session/build-run')
    //   .send({
    //     user_id: TEST_USER_ID,
    //     localPath: TEST_LOCAL_PATH,
    //     imageName: TEST_IMAGE_NAME,
    //     resources: { cpu: '0.5', memory: '200MB' }
    //   });

    console.log('🟣 [beforeAll] Building Docker image...');
    // Step 1: Build the Docker image
    const buildRes = await request(app)
      .post('/api/session/build')  // Use the build endpoint
      .send({
        user_id: TEST_USER_ID,
        localPath: TEST_LOCAL_PATH,
        imageName: TEST_IMAGE_NAME,
      })
      .set('Accept', 'application/json');
      

    expect(buildRes.statusCode).toBe(200);
    expect(buildRes.body).toHaveProperty('sessionId');

    createdSessionId = buildRes.body.sessionId; // Store the session ID for future use
    console.log(`✅ Built session ID: ${createdSessionId}`);
    // Give time for DB to register
    await new Promise(r => setTimeout(r, 1000));

    const sessions = await Session.find({ user_id: TEST_USER_ID });
    console.log('✅ DB Sessions after build:', sessions);
    expect(sessions.length).toBe(1);
    expect(sessions[0].image_name).toBe(TEST_IMAGE_NAME);


    console.log('🟣 [Test] Running container...');
    // Step 2: Run the container using the sessionId

    // Define cpu, memory, and port values
    const cpu = '0.5';  // Example CPU allocation
    const memory = '200MB';  // Example memory allocation
    const port = '8080:80';  // Example port

    const runRes = await request(app)
      .post('/api/domain/run')  // Use the domain route for running containers
      .send({
        session_id: createdSessionId, 
        
        cpu, memory, port// Pass the session ID to run the container
      });
    expect(runRes.statusCode).toBe(200);
    expect(runRes.body).toHaveProperty('containerId');
    testContainerId = runRes.body.containerId; // Store the container ID for future use
    console.log(`✅ Container started with ID: ${testContainerId}`);

    // Wait for the container to be fully up and running
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify the session in the database
    const updatedSessions = await Session.find({ user_id: TEST_USER_ID });
    console.log('✅ DB Sessions after running container:', updatedSessions);
    expect(updatedSessions.length).toBe(1);
    expect(updatedSessions[0].container_id).toBe(testContainerId);
    expect(updatedSessions[0].status).toBe('RUNNING');  // Check if status is 'RUNNING'
    
    // Store the container ID for later tests
    console.log(`✅ Updated container ID: ${testContainerId}`);
    testContainerId = updatedSessions[0].container_id; 
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


