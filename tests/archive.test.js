// // archive.test.js
// const request = require('supertest');
// const { app, server } = require('../server');
// const mongoose = require('mongoose');
// const User = require('../models/User');
// const Archive = require('../app/models/Archive'); // import Archive model
// const bcrypt = require('bcrypt');

// let testJwt = '';
// let testUserId = '';

// describe('Archive Feature', () => {
//   beforeAll(async () => {
//     // --- START: Comprehensive Database Cleanup ---
//     await Archive.deleteMany({});
//     await User.deleteMany({});
//     // --- END: Comprehensive Database Cleanup ---

//     // Create test user
//     const password_hash = await bcrypt.hash('123456', 10);
//     const user = new User({
//       email: 'test@example.com',
//       password_hash,
//       username: 'tester',
//     });
//     await user.save();
//     testUserId = user._id; // Store the ObjectId directly
//     console.log('DEBUG: testUserId after creation:', testUserId, 'Type:', typeof testUserId);

//     // Login to get JWT token
//     const res = await request(app)
//       .post('/api/auth/login')
//       .send({ email: 'test@example.com', password: '123456' });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.token).toBeDefined();
//     testJwt = res.body.token;
//   }, 20000);

//   afterAll(async () => {
//     // --- START: Comprehensive Database Cleanup ---
//     await Archive.deleteMany({});
//     await User.deleteMany({});
//     // --- END: Comprehensive Database Cleanup ---

//     // Close mongoose connection
//     await mongoose.connection.close();

//     // Close server properly to prevent open handles
//     if (server && server.close) {
//       await new Promise(resolve => server.close(resolve));
//     }
//   });

//   afterEach(async () => {
//     await Archive.deleteMany({ owner: testUserId });
//   });

//   it('should create a new archive with populated owner', async () => {
//     const res = await request(app)
//       .post('/api/archive')
//       .set('Authorization', `Bearer ${testJwt}`)
//       .send({ repoUrl: 'https://github.com/facebook/react' });

//     console.log('DEBUG: createArchive API Response Body:', JSON.stringify(res.body, null, 2));

//     expect(res.statusCode).toBe(201);

//     const archive = res.body;

//     // These assertions will now directly fail if owner is null, giving clearer output
//     expect(archive).toHaveProperty('owner');
//     expect(archive.owner).not.toBeNull(); // Explicitly check for not null
//     expect(archive.owner).toHaveProperty('username');
//     expect(archive.owner).toHaveProperty('email');
//     expect(archive.repoUrl).toBe('https://github.com/facebook/react');
//   }, 20000);

//   it('should get all archives with populated owners', async () => {
//     // Create an archive first to ensure data exists
//     const createRes = await request(app)
//       .post('/api/archive')
//       .set('Authorization', `Bearer ${testJwt}`)
//       .send({ repoUrl: 'https://github.com/facebook/react' });

//     expect(createRes.statusCode).toBe(201);
//     const createdArchiveId = createRes.body._id;

//     const res = await request(app)
//       .get('/api/archive')
//       .set('Authorization', `Bearer ${testJwt}`);

//     console.log('DEBUG: getAllArchives API Response Body:', JSON.stringify(res.body, null, 2));

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//     expect(res.body.length).toBeGreaterThan(0);

//     const foundArchive = res.body.find(archive => archive._id === createdArchiveId);

//     expect(foundArchive).toBeDefined();
//     expect(foundArchive).toHaveProperty('owner');
//     expect(foundArchive.owner).not.toBeNull(); // Explicitly check for not null
//     expect(foundArchive.owner).toHaveProperty('username');
//     expect(foundArchive.owner).toHaveProperty('email');
//     expect(String(foundArchive.owner._id)).toBe(String(testUserId));
//     expect(foundArchive.owner.email).toBe('test@example.com');
//     expect(foundArchive.owner.username).toBe('tester');
//   });
// });
