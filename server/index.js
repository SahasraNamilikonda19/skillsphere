const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const sessionRoutes = require('./routes/sessions');
const quizRoutes    = require('./routes/quiz');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/quiz',     quizRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SkillSphere API is running' });
});

// Global error handler — must be last
app.use(errorHandler);

// Socket.io events
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
  });

  socket.on('send-message', ({ sessionId, message }) => {
    io.to(sessionId).emit('receive-message', message);
  });

  socket.on('session-response', ({ userId, data }) => {
    io.to(userId).emit('notification', data);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
connectDB().then(() => {
  server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
});

module.exports = { io };