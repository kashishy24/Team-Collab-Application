import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Message, User } from './models/index.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import messageRoutes from './routes/messages.js';
import assistantRoutes from './routes/assistant.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: [process.env.CLIENT_ORIGIN, 'http://localhost:5173'], methods: ['GET', 'POST'] },
});


app.use(cors({
  origin: [
    "https://team-collab-application-wt9m-h2j9f7gge.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  origin: true,
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/assistant', assistantRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

io.on('connection', (socket) => {
  const teamId = socket.handshake.auth?.teamId;
  if (teamId) {
    socket.join(`team:${teamId}`);
  }

  socket.on('chat:message', async (payload) => {
    try {
      const { content, senderId, senderName } = payload;
      if (!teamId || !content?.trim() || !senderId) return;
      const message = await Message.create({
        content: content.trim(),
        senderId,
        teamId,
        timestamp: new Date(),
      });
      const populated = await Message.findById(message._id)
        .populate('senderId', 'name email')
        .lean();
      io.to(`team:${teamId}`).emit('chat:message', populated);
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  socket.on('disconnect', () => {});
});

async function connectDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamcollab';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

const PORT = process.env.PORT || 5000;
connectDb()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });

export { io };
