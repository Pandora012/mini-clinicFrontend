import api from './api';

export const dashboardService = {
  getStats: (signal) => api.get('/dashboard/stats', { signal }),
  getRecentRegistrations: () => api.get('/dashboard/recent-registrations'),
  getPatientStatistics: () => api.get('/dashboard/patient-statistics')
};
