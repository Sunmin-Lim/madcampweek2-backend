// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRouter = require('./routes/auth');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mydatabase')
  .then(() => console.log('✅ MongoDB 연결 성공! (Connection successful)'))
  .catch(err => console.error('❌ MongoDB 연결 실패! (Connection failed):', err));

// 라우터 import
const sessionRoutes = require('./app/api/session/session.routes');
const terminalRoutes = require('./app/api/terminal/terminal.routes');
const sessionAdminRoutes = require('./app/api/session/session.admin.routes');
const gitCloneRoutes = require('./routes/gitController');  // git_clone 기능 라우터 경로

// 라우터 등록
app.use('/api/auth', authRouter);
app.use('/api/session', sessionRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/session/admin', sessionAdminRoutes);
app.use('/api/gitController', gitCloneRoutes);  // git_clone 기능 경로

// 기본 루트 라우트
app.get('/', (req, res) => {
  res.send('Hello from the Node.js Backend!');
});

// 서버 인스턴스 변수
let serverInstance;

// 메인 모듈에서 실행될 때만 서버 시작
if (require.main === module) {
  serverInstance = app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}

module.exports = { app, server: serverInstance };
