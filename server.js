// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// ⭐️ [1] auth 라우터 임포트
const authRoutes = require('./routes/auth');

// ⭐️ [2] 미들웨어
app.use(cors());
app.use(express.json());

// ⭐️ [3] 기본 라우트 테스트
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// ⭐️ [4] /api/auth 경로에 라우터 연결
app.use('/api/auth', authRoutes);

// ⭐️ [5] MongoDB 연결
mongoose.connect('mongodb://127.0.0.1:27017/mydatabase')
  .then(() => console.log('✅ MongoDB 연결 성공!'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// ⭐️ [6] 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});