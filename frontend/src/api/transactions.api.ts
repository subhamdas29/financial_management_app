import api from './axios';

export const transactionsApi = {
  getAll: (params?: any) => api.get('/transactions', { params }),
  getById: (id: string) => api.get(`/transactions/${id}`),
  getStats: (accountId?: string) =>
    api.get('/transactions/stats', { params: { accountId } }),
  create: (data: any) => api.post('/transactions', data),
  update: (id: string, data: any) => api.patch(`/transactions/${id}`, data),
};