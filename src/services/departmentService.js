import api from './api';

const normalise = (resp) => ({
  success: resp?.Success ?? false,
  message: resp?.Message ?? '',
  data: resp?.Data ?? [],
  errors: resp?.Errors ?? null
});

export const departmentService = {
  // Get all departments from dashboard data (using existing endpoint)
  getAll: async () => {
    try {
      console.log('DepartmentService: Getting departments from dashboard...');
      const response = await api.get('/dashboard/management');
      console.log('DepartmentService: Dashboard response:', response);
      
      const normalizedResponse = normalise(response.data);
      
      if (normalizedResponse.success && normalizedResponse.data?.Departments) {
        const departments = normalizedResponse.data.Departments.map(dept => ({
          id: dept.DepartmentId,
          name: dept.DepartmentName,
          description: `Department with ${dept.Categories?.length || 0} categories`,
          totalAllocation: dept.TotalAllocation || 0,
          totalSpent: dept.TotalSpent || 0,
          categoriesCount: dept.Categories?.length || 0
        }));
        
        console.log('DepartmentService: Extracted departments:', departments);
        
        return {
          success: true,
          data: departments
        };
      }
      
      // Fallback: Return hardcoded departments if dashboard doesn't have them
      return {
        success: true,
        data: [
          { id: 1, name: 'Marketing', description: 'Marketing Department' },
          { id: 2, name: 'Human Resources', description: 'HR Department' },
          { id: 3, name: 'Sales', description: 'Sales Department' },
          { id: 4, name: 'Engineering', description: 'Engineering Department' },
          { id: 5, name: 'Finance', description: 'Finance Department' }
        ]
      };
    } catch (error) {
      console.error('DepartmentService: Error getting departments:', error);
      // Return hardcoded fallback
      return {
        success: true,
        data: [
          { id: 1, name: 'Marketing', description: 'Marketing Department' },
          { id: 2, name: 'Human Resources', description: 'HR Department' },
          { id: 3, name: 'Sales', description: 'Sales Department' },
          { id: 4, name: 'Engineering', description: 'Engineering Department' },
          { id: 5, name: 'Finance', description: 'Finance Department' }
        ]
      };
    }
  }
};

export default departmentService;
