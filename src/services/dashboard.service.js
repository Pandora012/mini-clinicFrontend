import api from './api';

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentRegistrations: () => api.get('/dashboard/recent-registrations'),
  getPatientStatistics: () => api.get('/dashboard/patient-statistics')
};