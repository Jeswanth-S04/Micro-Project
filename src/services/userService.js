import api from './api';

const normalise = (resp) => ({
  success: resp?.Success ?? false,
  message: resp?.Message ?? '',
  data: resp?.Data ?? [],
  errors: resp?.Errors ?? null
});

export const userService = {
  // Get all users (Admin only)
  getAll: async () => {
    try {
      console.log('UserService.getAll: Calling /users');
      const response = await api.get('/users');
      console.log('UserService.getAll: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService.getAll: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Get user by ID
  getById: async (id) => {
    try {
      console.log(`UserService.getById: Calling /users/${id}`);
      const response = await api.get(`/users/${id}`);
      console.log('UserService.getById: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService.getById: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Create new user
  create: async (userData) => {
    try {
      console.log('UserService.create: Creating user:', userData);
      const response = await api.post('/users', {
        Name: userData.name,
        Email: userData.email,
        Password: userData.password,
        Role: userData.role,
        DepartmentId: userData.departmentId,
        IsActive: userData.isActive
      });
      console.log('UserService.create: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService.create: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Update user
  update: async (id, userData) => {
    try {
      console.log('UserService.update: Updating user:', id, userData);
      const payload = {
        Name: userData.name,
        Email: userData.email,
        Role: userData.role,
        DepartmentId: userData.departmentId,
        IsActive: userData.isActive
      };
      
      // Only include password if provided
      if (userData.password) {
        payload.Password = userData.password;
      }
      
      const response = await api.put(`/users/${id}`, payload);
      console.log('UserService.update: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService.update: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Delete user
  delete: async (id) => {
    try {
      console.log('UserService.delete: Deleting user:', id);
      const response = await api.delete(`/users/${id}`);
      console.log('UserService.delete: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService.delete: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Get departments (for dropdown)
  getDepartments: async () => {
    try {
      console.log('UserService.getDepartments: Calling /departments');
      const response = await api.get('/departments');
      console.log('UserService.getDepartments: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService.getDepartments: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (id, oldPassword, newPassword) => {
    try {
      console.log(`UserService.changePassword: Changing password for user ${id}`);
      const response = await api.post(`/users/${id}/change-password`, {
        OldPassword: oldPassword,
        NewPassword: newPassword
      });
      console.log('UserService.changePassword: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService.changePassword: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Toggle user status
  toggleStatus: async (id) => {
    try {
      console.log(`UserService.toggleStatus: Toggling status for user ${id}`);
      const response = await api.post(`/users/${id}/toggle-status`);
      console.log('UserService.toggleStatus: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService.toggleStatus: Error:', error);
      throw error.response?.data || error;
    }
  }
};

export default userService;
