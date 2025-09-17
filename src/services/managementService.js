import api from './api';

export const managementService = {
  // Get management dashboard data
  getDashboard: async () => {
    try {
      console.log('🔍 ManagementService.getDashboard: Calling /management/dashboard');
      const response = await api.get('/management/dashboard');
      console.log('✅ ManagementService.getDashboard: Raw axios response:', response);
      console.log('✅ ManagementService.getDashboard: Response data:', response.data);
      
      // Return the response data directly without normalizing
      // since the component will handle both Success/success formats
      return response.data;
    } catch (error) {
      console.error('❌ ManagementService.getDashboard: Error:', error);
      throw error;
    }
  },

  // Get department performance data
  getDepartmentPerformance: async () => {
    try {
      console.log('🔍 ManagementService.getDepartmentPerformance: Calling /management/performance');
      const response = await api.get('/management/performance');
      console.log('✅ ManagementService.getDepartmentPerformance: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ManagementService.getDepartmentPerformance: Error:', error);
      // Return empty response instead of throwing to prevent crash
      return { Success: true, Data: [] };
    }
  }
};

export default managementService;
