import api from './api';

export const createWorkspace = (data) => api.post('/workspaces', data);

export const getWorkspaces = () => api.get('/workspaces');

export const getWorkspaceById = (id) => api.get(`/workspaces/${id}`);

export const updateWorkspace = (id, data) => api.put(`/workspaces/${id}`, data);

export const deleteWorkspace = (id) => api.delete(`/workspaces/${id}`);

export const inviteMember = (id, data) => api.post(`/workspaces/${id}/invite`, data);

export const removeMember = (id, memberId) =>
  api.delete(`/workspaces/${id}/members/${memberId}`);

export const leaveWorkspace = (id) => api.post(`/workspaces/${id}/leave`);

export const updateMemberRole = (id, memberId, data) =>
  api.put(`/workspaces/${id}/members/${memberId}/role`, data);

export const getMembers = (id, params) =>
  api.get(`/workspaces/${id}/members`, { params });
