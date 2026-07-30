import { io, onlineUsers } from '../config/socket.js';

function emitToUser(userId, event, data) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

function emitToWorkspace(workspaceId, event, data) {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit(event, data);
}

function emitToChannel(channelId, event, data) {
  if (!io) return;
  io.to(`channel:${channelId}`).emit(event, data);
}

function emitToOnlineUsers(event, data) {
  if (!io) return;
  io.emit(event, data);
}

function sendNotification(userId, notification) {
  if (!io) return;
  io.to(`user:${userId}`).emit('notification', notification);
}

export { emitToUser, emitToWorkspace, emitToChannel, emitToOnlineUsers, sendNotification };
