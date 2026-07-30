import api from './api';

export const getMessages = (workspaceId, channelId, params) =>
  api.get(`/channels/workspaces/${workspaceId}/channels/${channelId}/messages`, { params });

export const sendMessage = (workspaceId, channelId, data) =>
  api.post(`/channels/workspaces/${workspaceId}/channels/${channelId}/messages`, data);

export const editMessage = (messageId, data) =>
  api.put(`/channels/messages/${messageId}`, data);

export const deleteMessage = (messageId) =>
  api.delete(`/channels/messages/${messageId}`);

export const getChannels = (workspaceId) =>
  api.get(`/channels/workspaces/${workspaceId}/channels`);

export const createChannel = (workspaceId, data) =>
  api.post(`/channels/workspaces/${workspaceId}/channels`, data);

export const updateChannel = (workspaceId, channelId, data) =>
  api.put(`/channels/workspaces/${workspaceId}/channels/${channelId}`, data);

export const deleteChannel = (workspaceId, channelId) =>
  api.delete(`/channels/workspaces/${workspaceId}/channels/${channelId}`);

export const uploadFile = (formData) => api.post('/files/upload', formData);
