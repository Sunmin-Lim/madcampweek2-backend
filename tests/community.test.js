require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
app.use(express.json());
app.use('/api/community', require('../app/api/community'));

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Community API', () => {
  it('should get all links', async () => {
    const res = await request(app).get('/api/community/links');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new post', async () => {
    const res = await request(app)
      .post('/api/community/posts')
      .send({ title: 'Test Question', content: 'How do I test this?' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Question');
  });

  it('should add an answer to a post', async () => {
    const postRes = await request(app)
      .post('/api/community/posts')
      .send({ title: 'Question for Answer', content: 'Please answer' });

    const postId = postRes.body._id;

    const answerRes = await request(app)
      .post(`/api/community/posts/${postId}/answers`)
      .send({ text: 'This is an answer' });

    expect(answerRes.statusCode).toBe(200);
    expect(answerRes.body.answers.length).toBe(1);
  });
});
