import { api } from '@/lib/api';
import { User } from '@/types';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
};
