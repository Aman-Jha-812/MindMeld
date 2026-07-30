import api from './api';

export const getInvitation = (token) => api.get(`/invitations/${token}`);

export const acceptInvitation = (token) => api.post(`/invitations/${token}/accept`);
