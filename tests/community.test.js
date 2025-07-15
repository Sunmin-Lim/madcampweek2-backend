require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');

// ✅ Import community routes
const communityRouter = require('../app/api/search/community.routes');

// ✅ Temporary Express App
const app = express();
app.use(express.json());
app.use('/api/community', communityRouter);

let createdPostId;

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

  it('✅ should create a new post with tags', async () => {
    const res = await request(app)
      .post('/api/community/posts')
      .send({
        title: 'Test Question',
        content: 'How do I test this?',
        tags: ['test', 'flutter']
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Question');
    expect(res.body.tags).toContain('test');

    createdPostId = res.body._id;
  });

  it('✅ should search posts by tag', async () => {
    const res = await request(app).get('/api/community/posts/search?tag=test');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(p => p.tags.includes('test'))).toBe(true);
  });

  it('✅ should increment post view count', async () => {
    const viewRes = await request(app).post(`/api/community/posts/${createdPostId}/view`);
    expect(viewRes.statusCode).toBe(200);
    expect(viewRes.body.views).toBeGreaterThanOrEqual(1);
  });

  it('✅ should get top 3 posts by views', async () => {
    // Add views to ensure it ranks
    await request(app).post(`/api/community/posts/${createdPostId}/view`);
    await request(app).post(`/api/community/posts/${createdPostId}/view`);
    await request(app).post(`/api/community/posts/${createdPostId}/view`);

    const res = await request(app).get('/api/community/posts/top');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(3);
  });

  it('✅ should add an answer to a post', async () => {
    const answerRes = await request(app)
      .post(`/api/community/posts/${createdPostId}/answers`)
      .send({ text: 'This is an answer' });

    expect(answerRes.statusCode).toBe(200);
    expect(answerRes.body).toHaveProperty('_id');
    expect(Array.isArray(answerRes.body.answers)).toBe(true);
    expect(answerRes.body.answers.some(a => a.text === 'This is an answer')).toBe(true);
  });
});
