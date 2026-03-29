const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');
const aiRoutes = require('./routes/ai');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // or your frontend URL
  }
});
// 1. MIDDLEWARE
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/ai', aiRoutes);
// 2. SOCKET.IO
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join a session room
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined room: ${sessionId}`);
  });

  // Send message to everyone in the session room
  socket.on('send-message', ({ sessionId, message }) => {
    console.log(`Message in room ${sessionId}:`, message.content);
    // Broadcast to ALL users in the room INCLUDING sender
    // sender already adds their own message locally so we use to() not broadcast
    socket.to(sessionId).emit('receive-message', message);
  });

  socket.on('session-response', ({ userId, data }) => {
    io.to(userId).emit('notification', data);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});




// 3. EMERGENCY TEST ROUTE (Put this BEFORE other routes)
app.get('/manual-test', async (req, res) => {
  try {
    const testUser = await User.create({
      name: "Manual Test",
      email: `test${Date.now()}@gmail.com`,
      password: "password123"
    });
    res.send(`<h1>Success!</h1><p>Check Atlas for ID: ${testUser._id}</p>`);
  } catch (err) {
    res.status(500).send(`<h1>Failed</h1><p>${err.message}</p>`);
  }
});

// 4. MAIN ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/quiz', require('./routes/quiz'));

// 5. ERROR HANDLER (MUST BE LAST)
app.use(errorHandler);

// 6. START SERVER
connectDB().then(() => {
  server.listen(5000, () => {
    console.log('✅ Server running on http://localhost:5000');
  });
});

module.exports = { io };