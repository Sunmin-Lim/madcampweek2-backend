require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRouter = require('./app/api/auth/auth.routes');
const sessionRoutes = require('./app/api/session/session.routes');
const terminalRoutes = require('./app/api/terminal/terminal.routes');
const sessionAdminRoutes = require('./app/api/session/session.admin.routes');
const gitCloneRoutes = require('./app/api/gitclone/gitclone.routes');
const archiveRoutes = require('./app/api/archive/archive.routes');
const domainRoutes = require('./app/api/domain/domain.routes');
const searchRoutes = require('./app/api/search/search.routes');
const communityRoutes = require('./app/api/community/community.routes'); // ✅ NEW

// EXPRESS
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mydatabase')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection failed', err));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/session', sessionRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/session/admin', sessionAdminRoutes);
app.use('/api/gitController', gitCloneRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/domain', domainRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/community', communityRoutes); // ✅ NEW

app.get('/', (req, res) => {
  res.send('Hello from the Node.js Backend!');
});

// HTTP + WebSocket
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// WebSocket presence and chat
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('✅ WebSocket connected:', socket.id);

  socket.on('userOnline', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('presenceUpdate', Array.from(onlineUsers.keys()));
    console.log('✅ User online:', userId);
  });

  socket.on('sendMessage', (data) => {
    // Broadcast to room
    const { roomId, message, senderId } = data;
    io.to(roomId).emit('receiveMessage', { message, senderId });
  });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`✅ User ${socket.id} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    for (const [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('presenceUpdate', Array.from(onlineUsers.keys()));
    console.log('❌ User disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
});

module.exports = { app, server };
