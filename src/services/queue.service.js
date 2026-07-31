import api from './api';

export const queueService = {
  getTodayQueues: () => api.get('/queues/today'),
  getNextQueue: (params) => api.get('/queues/next', { params }),
  getHistory: (params) => api.get('/queues/history', { params }),
  updateStatus: (id, status) => api.put(`/queues/${id}/status`, { status })
};