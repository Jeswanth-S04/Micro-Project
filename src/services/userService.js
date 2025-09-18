import api from './api';

export const userService = {
  getAll: async () => {
    try {
      const response = await api.get('/users');
      return {
        success: response.data?.Success ?? false,
        data: response.data?.Data || [],
        message: response.data?.Message || ''
      };
    } catch (error) {
      console.error('UserService.getAll error:', error);
      throw error.response?.data || error;
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return {
        success: response.data?.Success ?? false,
        data: response.data?.Data || null,
        message: response.data?.Message || ''
      };
    } catch (error) {
      console.error('UserService.create error:', error);
      throw error.response?.data || error;
    }
  },

  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return {
        success: response.data?.Success ?? false,
        data: response.data?.Data || null,
        message: response.data?.Message || ''
      };
    } catch (error) {
      console.error('UserService.update error:', error);
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return {
        success: response.data?.Success ?? false,
        data: response.data?.Data || null,
        message: response.data?.Message || ''
      };
    } catch (error) {
      console.error('UserService.delete error:', error);
      throw error.response?.data || error;
    }
  }
};
