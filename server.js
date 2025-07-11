// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions'); // ⭐️ 나중에 추가할 라우터 준비

const app = express();
const PORT = 3000;

// ⭐️ [1] 미들웨어
app.use(cors());
app.use(express.json());

// ⭐️ [2] 기본 라우트
app.get('/', (req, res) => {
  res.send('✅ Hello, World! 서버가 잘 돌아가고 있어요!');
});

// ⭐️ [3] 라우터
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes); // ⭐️ 준비

// ⭐️ [4] MongoDB 연결
mongoose.connect('mongodb://host.docker.internal:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ [MongoDB] 연결 성공!'))
.catch(err => console.error('❌ [MongoDB] 연결 실패:', err));

// ⭐️ [5] 서버 시작
app.listen(PORT, () => {
  console.log(`✅ [Server] http://localhost:${PORT} 에서 실행 중!`);
});
