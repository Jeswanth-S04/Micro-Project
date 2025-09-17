// import api from './api';

// const normalise = (resp) => ({
//   success: resp?.Success ?? false,
//   message: resp?.Message ?? '',
//   data: resp?.Data ?? [],
//   errors: resp?.Errors ?? null
// });

// export const requestService = {
//   // Get pending requests (for finance admin)
//   getPending: async () => {
//     try {
//       console.log('🔍 RequestService.getPending: Calling /requests/pending');
//       const response = await api.get('/requests/pending');
//       console.log('✅ RequestService.getPending: Response:', response.data);
//       return normalise(response.data);
//     } catch (error) {
//       console.error('❌ RequestService.getPending: Error:', error);
//       throw error.response?.data || error;
//     }
//   },

//   // Get requests by department (for department heads)
//   getByDepartment: async (departmentId) => {
//     try {
//       console.log(`🔍 RequestService.getByDepartment: Calling /requests/department/${departmentId}`);
//       const response = await api.get(`/requests/department/${departmentId}`);
//       console.log('✅ RequestService.getByDepartment: Response:', response.data);
//       return normalise(response.data);
//     } catch (error) {
//       console.error('❌ RequestService.getByDepartment: Error:', error);
//       throw error.response?.data || error;
//     }
//   },

//   // Create a new request
//   create: async (requestData) => {
//     try {
//       console.log('🔍 RequestService.create: Sending data:', requestData);
      
//       const payload = {
//         DepartmentId: requestData.departmentId,
//         CategoryId: requestData.categoryId,
//         Reason: requestData.reason,
//         Amount: parseFloat(requestData.amount) || 0
//       };

//       console.log('📝 RequestService.create: Payload:', payload);
      
//       const response = await api.post('/requests', payload);
//       console.log('✅ RequestService.create: Response:', response.data);
      
//       return normalise(response.data);
//     } catch (error) {
//       console.error('❌ RequestService.create: Error:', error);
//       throw error.response?.data || error;
//     }
//   },

//   // Review a request (approve/reject)
//   review: async (reviewData) => {
//     try {
//       console.log('🔍 RequestService.review: Sending data:', reviewData);
      
//       const payload = {
//         RequestId: parseInt(reviewData.requestId) || reviewData.requestId,
//         Approve: reviewData.approve === true || reviewData.approve === 'true',
//         ReviewerNote: reviewData.reviewerNote?.trim() || ''
//       };

//       console.log('📝 RequestService.review: Payload:', payload);
      
//       const response = await api.post('/requests/review', payload);
//       console.log('✅ RequestService.review: Response:', response.data);
      
//       return normalise(response.data);
//     } catch (error) {
//       console.error('❌ RequestService.review: Error:', error);
//       console.error('❌ RequestService.review: Error details:', {
//         status: error.response?.status,
//         statusText: error.response?.statusText,
//         data: error.response?.data
//       });
//       throw error.response?.data || error;
//     }
//   },

//   // Get request by ID
//   getById: async (requestId) => {
//     try {
//       console.log(`🔍 RequestService.getById: Calling /requests/${requestId}`);
//       const response = await api.get(`/requests/${requestId}`);
//       console.log('✅ RequestService.getById: Response:', response.data);
      
//       const normalizedResponse = {
//         success: response.data?.Success ?? false,
//         message: response.data?.Message ?? '',
//         data: response.data?.Data ? {
//           id: response.data.Data.Id,
//           departmentId: response.data.Data.DepartmentId,
//           categoryId: response.data.Data.CategoryId,
//           amount: response.data.Data.Amount,
//           reason: response.data.Data.Reason,
//           status: response.data.Data.Status,
//           createdAt: response.data.Data.CreatedAt,
//           reviewedAt: response.data.Data.ReviewedAt,
//           reviewerNote: response.data.Data.ReviewerNote,
//           departmentName: response.data.Data.DepartmentName,
//           categoryName: response.data.Data.CategoryName
//         } : null,
//         errors: response.data?.Errors ?? null
//       };
      
//       return normalizedResponse;
//     } catch (error) {
//       console.error('❌ RequestService.getById: Error:', error);
//       throw error.response?.data || error;
//     }
//   },

//   // Update request status (alternative to review)
//   updateStatus: async (requestId, status, reviewerNote = '') => {
//     try {
//       console.log('🔍 RequestService.updateStatus: Updating request:', { requestId, status, reviewerNote });
      
//       const payload = {
//         RequestId: parseInt(requestId),
//         Status: status, // 0 = Pending, 1 = Approved, 2 = Rejected
//         ReviewerNote: reviewerNote?.trim() || ''
//       };

//       const response = await api.patch(`/requests/${requestId}/status`, payload);
//       console.log('✅ RequestService.updateStatus: Response:', response.data);
      
//       return normalise(response.data);
//     } catch (error) {
//       console.error('❌ RequestService.updateStatus: Error:', error);
//       throw error.response?.data || error;
//     }
//   },

//   // Cancel/Delete request (for department heads)
//   cancel: async (requestId) => {
//     try {
//       console.log(`🔍 RequestService.cancel: Canceling request ${requestId}`);
//       const response = await api.delete(`/requests/${requestId}`);
//       console.log('✅ RequestService.cancel: Response:', response.data);
      
//       return normalise(response.data);
//     } catch (error) {
//       console.error('❌ RequestService.cancel: Error:', error);
//       throw error.response?.data || error;
//     }
//   },

//   // Get request statistics
//   getStatistics: async (departmentId = null) => {
//     try {
//       const url = departmentId 
//         ? `/requests/statistics?departmentId=${departmentId}`
//         : '/requests/statistics';
      
//       console.log(`🔍 RequestService.getStatistics: Calling ${url}`);
//       const response = await api.get(url);
//       console.log('✅ RequestService.getStatistics: Response:', response.data);
      
//       return normalise(response.data);
//     } catch (error) {
//       console.error('❌ RequestService.getStatistics: Error:', error);
//       throw error.response?.data || error;
//     }
//   },

//   // Get requests with filters and pagination
//   getWithFilters: async (filters = {}) => {
//     try {
//       const params = new URLSearchParams();
      
//       if (filters.status !== undefined) params.append('status', filters.status);
//       if (filters.departmentId) params.append('departmentId', filters.departmentId);
//       if (filters.categoryId) params.append('categoryId', filters.categoryId);
//       if (filters.startDate) params.append('startDate', filters.startDate);
//       if (filters.endDate) params.append('endDate', filters.endDate);
//       if (filters.page) params.append('page', filters.page);
//       if (filters.pageSize) params.append('pageSize', filters.pageSize);

//       const url = `/requests?${params.toString()}`;
//       console.log(`🔍 RequestService.getWithFilters: Calling ${url}`);
      
//       const response = await api.get(url);
//       console.log('✅ RequestService.getWithFilters: Response:', response.data);
      
//       return normalise(response.data);
//     } catch (error) {
//       console.error('❌ RequestService.getWithFilters: Error:', error);
//       throw error.response?.data || error;
//     }
//   },

//   // Bulk approve/reject requests (for finance admin)
//   bulkReview: async (requestIds, approve, reviewerNote = '') => {
//     try {
//       console.log('🔍 RequestService.bulkReview: Processing bulk review:', {
//         requestIds,
//         approve,
//         reviewerNote
//       });
      
//       const payload = {
//         RequestIds: requestIds.map(id => parseInt(id)),
//         Approve: approve,
//         ReviewerNote: reviewerNote?.trim() || ''
//       };

//       const response = await api.post('/requests/bulk-review', payload);
//       console.log('✅ RequestService.bulkReview: Response:', response.data);
      
//       return normalise(response.data);
//     } catch (error) {
//       console.error('❌ RequestService.bulkReview: Error:', error);
//       throw error.response?.data || error;
//     }
//   },

//   // Export requests to CSV/Excel
//   export: async (filters = {}, format = 'csv') => {
//     try {
//       const params = new URLSearchParams();
      
//       if (filters.status !== undefined) params.append('status', filters.status);
//       if (filters.departmentId) params.append('departmentId', filters.departmentId);
//       if (filters.categoryId) params.append('categoryId', filters.categoryId);
//       if (filters.startDate) params.append('startDate', filters.startDate);
//       if (filters.endDate) params.append('endDate', filters.endDate);
//       params.append('format', format);

//       const url = `/requests/export?${params.toString()}`;
//       console.log(`🔍 RequestService.export: Calling ${url}`);
      
//       const response = await api.get(url, {
//         responseType: 'blob'
//       });
      
//       console.log('✅ RequestService.export: Response received');
      
//       // Create download link
//       const blob = new Blob([response.data]);
//       const downloadUrl = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = `requests-${new Date().toISOString().split('T')[0]}.${format}`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(downloadUrl);
      
//       return {
//         success: true,
//         message: `Requests exported successfully as ${format.toUpperCase()}`
//       };
//     } catch (error) {
//       console.error('❌ RequestService.export: Error:', error);
//       throw error.response?.data || error;
//     }
//   },

//   // Get request history/audit trail
//   getHistory: async (requestId) => {
//     try {
//       console.log(`🔍 RequestService.getHistory: Calling /requests/${requestId}/history`);
//       const response = await api.get(`/requests/${requestId}/history`);
//       console.log('✅ RequestService.getHistory: Response:', response.data);
      
//       return normalise(response.data);
//     } catch (error) {
//       console.error('❌ RequestService.getHistory: Error:', error);
//       throw error.response?.data || error;
//     }
//   }
// };

// export default requestService;


import api from './api';

const normalise = (resp) => ({
  success: resp?.Success ?? false,
  message: resp?.Message ?? '',
  data: resp?.Data ?? [],
  errors: resp?.Errors ?? null
});

export const requestService = {
  // Get pending requests (for finance admin)
  getPending: async () => {
    try {
      console.log('RequestService.getPending: Calling /requests/pending');
      const response = await api.get('/requests/pending');
      console.log('RequestService.getPending: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('RequestService.getPending: Error:', error);
      if (error.response?.status === 403) {
        console.log('403 Forbidden - trying alternative approach');
        // Try alternative approach if 403
        return { Success: false, Data: [], Message: 'Access denied' };
      }
      throw error.response?.data || error;
    }
  },

  // Get requests by department
  getByDepartment: async (departmentId) => {
    try {
      console.log(`RequestService.getByDepartment: Calling /requests/department/${departmentId}`);
      const response = await api.get(`/requests/department/${departmentId}`);
      console.log('RequestService.getByDepartment: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('RequestService.getByDepartment: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Create new request
  create: async (requestData) => {
    try {
      console.log('RequestService.create: Creating request:', requestData);
      const response = await api.post('/requests', requestData);
      console.log('RequestService.create: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('RequestService.create: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Review request (approve/reject)
  review: async (reviewData) => {
    try {
      console.log('RequestService.review: Reviewing request:', reviewData);
      const response = await api.post('/requests/review', reviewData);
      console.log('RequestService.review: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('RequestService.review: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Get request statistics
  getStatistics: async (departmentId = null) => {
    try {
      const url = departmentId 
        ? `/requests/statistics?departmentId=${departmentId}`
        : '/requests/statistics';
      console.log(`RequestService.getStatistics: Calling ${url}`);
      const response = await api.get(url);
      console.log('RequestService.getStatistics: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('RequestService.getStatistics: Error:', error);
      throw error.response?.data || error;
    }
  }
};

export default requestService;
