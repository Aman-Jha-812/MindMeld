import api from './api';

export const getRecentActivity = (limit = 10) =>
  api.get('/activity/recent', { params: { limit } });

export const getWorkspaceTasks = (workspaceId) =>
  api.get(`/tasks/workspaces/${workspaceId}/tasks`);

export const getUnreadCount = () => api.get('/notifications/unread-count');
