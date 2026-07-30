import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;
const onlineUsers = new Map();

const setupSocket = (httpServer) => {
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map(s => s.trim());
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email avatar');
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    io.emit('user_online', { userId });

    socket.join(`user:${userId}`);

    socket.on('join_workspace', ({ workspaceId }) => {
      if (!workspaceId) return;
      socket.join(`workspace:${workspaceId}`);
      io.to(`workspace:${workspaceId}`).emit('user_joined_workspace', {
        userId,
        workspaceId,
      });
    });

    socket.on('leave_workspace', ({ workspaceId }) => {
      if (!workspaceId) return;
      socket.leave(`workspace:${workspaceId}`);
      io.to(`workspace:${workspaceId}`).emit('user_left_workspace', {
        userId,
        workspaceId,
      });
    });

    socket.on('join_channel', ({ channelId }) => {
      if (!channelId) return;
      socket.join(`channel:${channelId}`);
    });

    socket.on('leave_channel', ({ channelId }) => {
      if (!channelId) return;
      socket.leave(`channel:${channelId}`);
    });

    socket.on('send_message', (data) => {
      const { workspaceId, channelId, message } = data;
      if (!workspaceId || !channelId || !message) return;
      io.to(`workspace:${workspaceId}`).emit('new_message', {
        ...message,
        sender: socket.user,
      });
    });

    socket.on('typing', ({ workspaceId, channelId }) => {
      if (!workspaceId || !channelId) return;
      socket.to(`workspace:${workspaceId}`).emit('user_typing', {
        userId,
        channelId,
        user: socket.user,
      });
    });

    socket.on('stop_typing', ({ workspaceId, channelId }) => {
      if (!workspaceId || !channelId) return;
      socket.to(`workspace:${workspaceId}`).emit('user_stop_typing', {
        userId,
        channelId,
      });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user_offline', { userId });
    });
  });

  return io;
};

export { setupSocket, io, onlineUsers };