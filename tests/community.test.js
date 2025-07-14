require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');

// ✅ 서버 라우터
const communityRouter = require('../app/api/community/community.routes');

// ✅ Express 앱 임시 생성
const app = express();
app.use(express.json());
app.use('/api/community', communityRouter);

beforeAll(async () => {
  console.log('✅ Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected!');
});

afterAll(async () => {
  console.log('✅ Closing MongoDB...');
  await mongoose.connection.close();
});

describe('✅ Community API Tests', () => {
  it('✅ should get all links', async () => {
    const res = await request(app).get('/api/community/links');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('✅ should create a new post', async () => {
    const res = await request(app)
      .post('/api/community/posts')
      .send({ title: 'Test Question', content: 'How do I test this?' });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Question');
  });

  it('✅ should add an answer to a post', async () => {
    // 먼저 포스트 생성
    const postRes = await request(app)
      .post('/api/community/posts')
      .send({ title: 'Question for Answer', content: 'Please answer' });

    expect(postRes.statusCode).toBe(201);
    const postId = postRes.body._id;

    // 답변 추가
    const answerRes = await request(app)
      .post(`/api/community/posts/${postId}/answers`)
      .send({ text: 'This is an answer' });

    expect(answerRes.statusCode).toBe(200);
    expect(answerRes.body.answers.length).toBeGreaterThanOrEqual(1);
  });
});
