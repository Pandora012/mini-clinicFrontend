import api from './api';

export const queueService = {
  getTodayQueues: (signal) => api.get('/queues/today', { signal }),
  callNextQueue: () => api.post('/queues/next'),
  getNextQueue: (params) => api.get('/queues/next', { params }),
  getHistory: (params) => api.get('/queues/history', { params }),
  updateStatus: (id, status) => api.put(`/queues/${id}/status`, { status })
};
