const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions'); // ⭐️ 나중에 추가할 라우터 준비

const app = express();
const PORT = 3000;

// ⭐️ [1] auth 라우터 임포트
const authRoutes = require('./routes/auth');
// ⭐️ [2] gitController 라우터 임포트
const gitController = require('./routes/gitController');  // Git 클론을 위한 라우터

// ⭐️ [3] 미들웨어
app.use(cors());
app.use(express.json());

// ⭐️ [4] 기본 라우트 테스트
app.get('/', (req, res) => {
  res.send('✅ Hello, World! 서버가 잘 돌아가고 있어요!');
});

// ⭐️ [5] /api/auth 경로에 auth 라우터 연결
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes); // ⭐️ 준비

// ⭐️ [6] /api/gitController 경로에 gitController 라우터 연결
app.use('/api/gitController', gitController);  // 이 부분을 추가

// ⭐️ [7] MongoDB 연결
mongoose.connect('mongodb://127.0.0.1:27017/mydatabase')
  .then(() => console.log('✅ MongoDB 연결 성공!'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// ⭐️ [8] 서버 시작
app.listen(PORT, () => {
  console.log(`✅ [Server] http://localhost:${PORT} 에서 실행 중!`);
});
