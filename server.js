// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRouter = require('./app/api/auth/auth.routes');
const sessionRoutes = require('./app/api/session/session.routes');
const terminalRoutes = require('./app/api/terminal/terminal.routes');
const sessionAdminRoutes = require('./app/api/session/session.admin.routes');
const gitCloneRoutes = require('./routes/gitController');
const githubAuthRouter = require('./app/api/auth/github.routes');
const archiveRoutes = require('./app/api/archive/archive.routes');
const domainRoutes = require('./app/api/domain/domain.routes'); // Ensure correct import

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mydatabase')
  .then(() => console.log('✅ MongoDB 연결 성공! (Connection successful)'))
  .catch(err => console.error('❌ MongoDB 연결 실패! (Connection failed):', err));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/session', sessionRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/session/admin', sessionAdminRoutes);
app.use('/api/gitController', gitCloneRoutes);
app.use('/api/auth', githubAuthRouter);
app.use('/api/archive', archiveRoutes);
app.use('/api/domain', domainRoutes);    // Routes for domain (container running)

app.get('/', (req, res) => {
  res.send('Hello from the Node.js Backend!');
});

// Conditionally start server if run directly
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}

// Export both for tests
module.exports = { app, server };
