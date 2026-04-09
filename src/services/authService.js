import api from '../api/axios';

export const authService = {
  async register(data) {
    const res = await api.post('/api/auth/register', data);
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data;
  },
};
