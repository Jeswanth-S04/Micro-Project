import api from './api';

const normalise = (resp) => ({
  success: resp?.Success ?? false,
  message: resp?.Message ?? '',
  data: resp?.Data ?? [],
  errors: resp?.Errors ?? null
});

export const allocationService = {
  // Get all allocations for ADMIN (using dashboard endpoint)
  getAll: async () => {
    try {
      console.log('AllocationService.getAll: Calling dashboard/management...');
      const response = await api.get('/dashboard/management');
      console.log('AllocationService.getAll: Dashboard response:', response.data);
      
      const normalizedResponse = normalise(response.data);
      console.log('AllocationService.getAll: Normalized response:', normalizedResponse);
      
      if (normalizedResponse.success && normalizedResponse.data?.Departments) {
        const allAllocations = [];
        
        normalizedResponse.data.Departments.forEach(dept => {
          if (dept.Categories && Array.isArray(dept.Categories)) {
            dept.Categories.forEach(cat => {
              allAllocations.push({
                id: `${dept.DepartmentId}-${cat.CategoryId}`,
                departmentId: dept.DepartmentId,
                categoryId: cat.CategoryId,
                departmentName: dept.DepartmentName,
                categoryName: cat.CategoryName,
                amount: cat.Allocation || 0,
                spent: cat.Spent || 0,
                createdAt: new Date().toISOString(),
                timeframe: 'Monthly'
              });
            });
          }
        });
        
        console.log('AllocationService.getAll: Extracted allocations:', allAllocations);
        return {
          success: true,
          data: allAllocations
        };
      } else {
        console.log('AllocationService.getAll: No departments in dashboard data');
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error('AllocationService.getAll: Error:', error);
      return { success: true, data: [] };
    }
  },

  // Get allocations by department (for department users)
  getByDepartment: async (departmentId) => {
    try {
      console.log(`AllocationService.getByDepartment: Calling /allocations/department/${departmentId}...`);
      const response = await api.get(`/allocations/department/${departmentId}`);
      console.log('AllocationService.getByDepartment: Response:', response.data);
      
      const normalizedResponse = normalise(response.data);
      
      // Map the backend response to frontend format
      if (normalizedResponse.success && Array.isArray(normalizedResponse.data)) {
        const mappedAllocations = normalizedResponse.data.map(allocation => ({
          id: allocation.Id,
          departmentId: allocation.DepartmentId,
          categoryId: allocation.CategoryId,
          departmentName: allocation.DepartmentName || 'Unknown Department',
          categoryName: allocation.CategoryName || 'Unknown Category',
          amount: allocation.Amount || 0,
          spent: allocation.Spent || 0,
          createdAt: allocation.CreatedAt || new Date().toISOString(),
          timeframe: allocation.Timeframe || 'Monthly'
        }));
        
        return {
          success: true,
          data: mappedAllocations
        };
      }
      
      return normalizedResponse;
    } catch (error) {
      console.error('AllocationService.getByDepartment: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Create a new allocation
  create: async (allocationData) => {
    try {
      console.log('AllocationService.create: Creating allocation:', allocationData);
      const response = await api.post('/allocations', {
        DepartmentId: allocationData.departmentId,
        CategoryId: allocationData.categoryId,
        Amount: allocationData.amount,
        Timeframe: allocationData.timeframe || 'Monthly'
      });
      console.log('AllocationService.create: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('AllocationService.create: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Update an existing allocation
  update: async (allocationId, allocationData) => {
    try {
      console.log('AllocationService.update: Updating allocation:', allocationId, allocationData);
      const response = await api.put(`/allocations/${allocationId}`, {
        DepartmentId: allocationData.departmentId,
        CategoryId: allocationData.categoryId,
        Amount: allocationData.amount,
        Timeframe: allocationData.timeframe || 'Monthly'
      });
      console.log('AllocationService.update: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('AllocationService.update: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Update spent amount only
  updateSpent: async (allocationId, newSpent) => {
    try {
      console.log(`AllocationService.updateSpent: Updating spent for ${allocationId} to ${newSpent}`);
      const response = await api.patch(`/allocations/${allocationId}/spent?newSpent=${newSpent}`);
      console.log('AllocationService.updateSpent: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('AllocationService.updateSpent: Error:', error);
      throw error.response?.data || error;
    }
  }, 
//   delete: async (allocationId) => {
//     try {
//       console.log('AllocationService.delete: Deleting allocation:', allocationId);
//       const response = await api.delete(`/allocations/${allocationId}`);
//       console.log('AllocationService.delete: Response:', response.data);
//       return normalise(response.data);
//     } catch (error) {
//       console.error('AllocationService.delete: Error:', error);
//       throw error.response?.data || error;
//     }
//   },

  // Delete an allocation
  delete: async (allocationId) => {
    try {
      console.log('AllocationService.delete: Deleting allocation:', allocationId);
      const response = await api.delete(`/allocations/${allocationId}`);
      console.log('AllocationService.delete: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('AllocationService.delete: Error:', error);
      throw error.response?.data || error;
    }
  }
};

export default allocationService;
