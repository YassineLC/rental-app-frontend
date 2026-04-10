import api from '../api/axios';

export const bookingService = {
  async create(data) {
    const res = await api.post('/api/bookings', data);
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/api/bookings/${id}`);
    return res.data;
  },

  async getMyBookings() {
    const res = await api.get('/api/bookings/my-bookings');
    return res.data;
  },

  async getOwnerRequests() {
    const res = await api.get('/api/bookings/owner/requests');
    return res.data;
  },

  async confirm(id) {
    const res = await api.put(`/api/bookings/${id}/confirm`);
    return res.data;
  },

  async cancel(id) {
    const res = await api.put(`/api/bookings/${id}/cancel`);
    return res.data;
  },

  async getUnavailablePeriods(propertyId) {
    const res = await api.get(`/api/bookings/property/${propertyId}/unavailable`);
    return res.data;
  },
};
