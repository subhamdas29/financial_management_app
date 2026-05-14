import api from './axios';

export const foldersApi = {
  getAll: () => api.get('/folders'),
  getById: (id: string) => api.get(`/folders/${id}`),
  getSummary: () => api.get('/folders/summary'),
  getFolderSummary: (id: string, month?: string) =>
    api.get(`/folders/${id}/summary`, { params: { month } }),
  create: (data: any) => api.post('/folders', data),
  update: (id: string, data: any) => api.patch(`/folders/${id}`, data),
  delete: (id: string) => api.delete(`/folders/${id}`),
};