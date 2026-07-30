import api from './api';

export const getProfile = () => api.get('/users/profile');

export const updateProfile = (data) => api.put('/users/profile', data);

export const updateAvatar = (formData) =>
  api.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updatePassword = (data) => api.put('/auth/update-password', data);

export const updateNotificationSettings = (data) =>
  api.put('/users/notifications', data);
