import api from './api';

const normalise = (resp) => ({
  success: resp?.Success ?? false,
  message: resp?.Message ?? '',
  data: resp?.Data ?? null,
  errors: resp?.Errors ?? null
});

const dashboardService = {
  // Get admin dashboard summary
  getAdminSummary: async () => {
    try {
      const response = await api.get('/dashboard/management');
      return normalise(response.data);
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw error.response?.data || error;
    }
  },

  // Get department dashboard summary
  getDepartmentSummary: async () => {
    try {
      const response = await api.get('/dashboard/department');
      return normalise(response.data);
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw error.response?.data || error;
    }
  },

  // Get management dashboard summary
  getManagementSummary: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);

      const response = await api.get(`/dashboard/management?${params.toString()}`);
      return normalise(response.data);
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw error.response?.data || error;
    }
  },

  // Fallback method for testing
  getMockSummary: () => {
    return {
      success: true,
      data: {
        totalCategories: 0,
        totalAllocations: 0,
        pendingRequests: 0,
        totalBudget: 0
      }
    };
  }
};

// Export both named and default
export { dashboardService };
export default dashboardService;
