import api from '../api/axios';

export const propertyService = {
  async getAll(params = {}) {
    const res = await api.get('/api/properties', { params });
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/api/properties/${id}`);
    return res.data;
  },

  async getMyProperties() {
    const res = await api.get('/api/properties/owner/me');
    return res.data;
  },

  async create(data) {
    const res = await api.post('/api/properties', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/api/properties/${id}`, data);
    return res.data;
  },

  async delete(id) {
    await api.delete(`/api/properties/${id}`);
  },

  async toggleAvailability(id, available) {
    await api.patch(`/api/properties/${id}/availability`, null, { params: { available } });
  },
};
