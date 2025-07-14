require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRouter = require('./app/api/auth/auth.routes');
const sessionRoutes = require('./app/api/session/session.routes');
const terminalRoutes = require('./app/api/terminal/terminal.routes');
const sessionAdminRoutes = require('./app/api/session/session.admin.routes');
const gitCloneRoutes = require('./app/api/gitclone/gitclone.routes');
const archiveRoutes = require('./app/api/archive/archive.routes');
const domainRoutes = require('./app/api/domain/domain.routes');
const communityRoutes = require('./app/api/community/community.routes'); // ✅ 추가

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mydatabase')
  .then(() => console.log('✅ MongoDB 연결 성공!'))
  .catch(err => console.error('❌ MongoDB 연결 실패!', err));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/session', sessionRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/session/admin', sessionAdminRoutes);
app.use('/api/gitController', gitCloneRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/domain', domainRoutes);
app.use('/api/community', communityRoutes); // ✅ 꼭 prefix 추가

app.get('/', (req, res) => {
  res.send('Hello from the Node.js Backend!');
});

// Start
let server;
if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
  });
}

// For testing
module.exports = { app, server };
