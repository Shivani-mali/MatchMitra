import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (uid) => api.get(`/users/${uid}`),
  update: (uid, payload) => api.put(`/users/${uid}`, payload),
};

export const interestsApi = {
  create: (payload) => api.post('/interests', payload),
  updateStatus: (interestId, payload) => api.patch(`/interests/${interestId}/status`, payload),
  getForUser: (uid) => api.get(`/interests/user/${uid}`),
};

export const reportsApi = {
  create: (payload) => api.post('/reports', payload),
};

export const chatApi = {
  getMessages: (chatId) => api.get(`/chat/${chatId}/messages`),
  sendMessage: (chatId, payload) => api.post(`/chat/${chatId}/messages`, payload),
};

export default api;
