import api from './api';

export const registrationService = {
  getAll: (params) => api.get('/registrations', { params }),
  getById: (id) => api.get(`/registrations/${id}`),
  create: (data) => api.post('/registrations', data),
  update: (id, data) => api.put(`/registrations/${id}`, data),
  delete: (id) => api.delete(`/registrations/${id}`)
};