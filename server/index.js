const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const cors         = require('cors');
require('dotenv').config();

const connectDB      = require('./config/db');
const errorHandler   = require('./middleware/errorHandler');

const app    = express();
const server = http.createServer(app);

// ── Allowed Origins ───────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

// ── Socket.io ─────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:      allowedOrigins,
    methods:     ['GET', 'POST'],
    credentials: true
  }
});

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/quiz',     require('./routes/quiz'));
app.use('/api/ai',       require('./routes/ai'));

// ── Health Check ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'SkillSphere API is running ✅' });
});

// ── Error Handler (must be last) ──────────────────────────
app.use(errorHandler);

// ── Socket.io Events ──────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined room: ${sessionId}`);
  });

  socket.on('send-message', ({ sessionId, message }) => {
    socket.to(sessionId).emit('receive-message', message);
  });

  socket.on('session-response', ({ userId, data }) => {
    io.to(userId).emit('notification', data);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ── Start Server ──────────────────────────────────────────
connectDB().then(() => {
  server.listen(process.env.PORT || 5000, () => {
    console.log(`✅ Server running on http://localhost:${process.env.PORT || 5000}`);
  });
});

module.exports = { io };