import api from './api';

export const patientService = {
  getAll: (params, signal) => api.get('/patients', { params, signal }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`)
};
