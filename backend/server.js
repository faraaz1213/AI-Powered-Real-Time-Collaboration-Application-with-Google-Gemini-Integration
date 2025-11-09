import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from './app.js';
import Project from './models/project.model.js';
import { generateResult } from './services/ai.service.js';

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create HTTP + Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// AUTH MIDDLEWARE
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const projectId = socket.handshake.query?.projectId;

    if (!token) return next(new Error('Authentication error'));

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) return next(new Error('Invalid projectId'));

    const project = await Project.findById(projectId);
    if (!project) return next(new Error('Project not found'));

    socket.project = project;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// CONNECTION EVENT
io.on('connection', (socket) => {
  // Join project room
  socket.join(socket.project._id.toString());

  // Notify others user is online
  io.to(socket.project._id.toString()).emit('user-online', { user: socket.user.email });

  // Listen for message
  socket.on('project-message', async (data) => {
    const message = data.message;

    // AI response
    if (message.includes('@ai')) {
      const prompt = message.replace('@ai', '');
      const result = await generateResult(prompt);
      io.to(socket.project._id.toString()).emit('project-message', {
        message: result,
        sender: 'AI',
      });
      return;
    }

    // Save message to DB
    await Project.findByIdAndUpdate(socket.project._id, {
      $push: { messages: { sender: socket.user._id, message } },
    });

    // Emit message to all users
    io.to(socket.project._id.toString()).emit('project-message', {
      message,
      sender: socket.user.email,
    });
  });

  // Typing events
  socket.on('typing', () => {
    socket.broadcast.to(socket.project._id.toString()).emit('user-typing', { user: socket.user.email });
  });

  socket.on('stop-typing', () => {
    socket.broadcast.to(socket.project._id.toString()).emit('user-stop-typing', { user: socket.user.email });
  });

  // Disconnect
  socket.on('disconnect', () => {
    io.to(socket.project._id.toString()).emit('user-offline', { user: socket.user.email });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});