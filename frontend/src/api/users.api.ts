import api from './axios';

export const usersApi = {
  searchByEmail: (email: string) =>
    api.get('/users/search', { params: { email } }),
};