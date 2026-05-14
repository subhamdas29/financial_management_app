import api from './axios';

export const transfersApi = {
  getAll: (params?: any) => api.get('/transfers', { params }),
  getById: (id: string) => api.get(`/transfers/${id}`),
  getStats: () => api.get('/transfers/stats'),
  create: (data: any) => api.post('/transfers', data),
};