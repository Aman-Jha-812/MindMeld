import api from './api';

export const register = (data) => api.post('/auth/register', data);

export const login = (data) => api.post('/auth/login', data);

export const logout = () => api.post('/auth/logout');

export const getMe = () => api.get('/auth/me');

export const updatePassword = (data) => api.put('/auth/update-password', data);

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

export const resetPassword = (token, password) =>
  api.put(`/auth/reset-password/${token}`, { password });
