import api from './api';

const normalise = (resp) => ({
  success: resp?.Success ?? resp?.success ?? false,
  message: resp?.Message ?? resp?.message ?? '',
  data: resp?.Data ? (Array.isArray(resp.Data) ? resp.Data.map(item => ({
    id: item.Id ?? item.id,
    name: item.Name ?? item.name,
    limit: item.Limit ?? item.limit,
    timeframe: item.Timeframe ?? item.timeframe,
    thresholdPercent: item.ThresholdPercent ?? item.thresholdPercent
  })) : {
    id: resp.Data.Id ?? resp.Data.id,
    name: resp.Data.Name ?? resp.Data.name,
    limit: resp.Data.Limit ?? resp.Data.limit,
    timeframe: resp.Data.Timeframe ?? resp.Data.timeframe,
    thresholdPercent: resp.Data.ThresholdPercent ?? resp.Data.thresholdPercent
  }) : resp?.data || [],
  errors: resp?.Errors ?? resp?.errors ?? null
});

export const categoryService = {
  // Get all categories
  getAll: async () => {
    try {
      console.log('CategoryService.getAll: Calling /categories');
      const response = await api.get('/categories');
      console.log('CategoryService.getAll: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('CategoryService.getAll: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Get category by ID
  getById: async (id) => {
    try {
      console.log(`CategoryService.getById: Calling /categories/${id}`);
      const response = await api.get(`/categories/${id}`);
      console.log('CategoryService.getById: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('CategoryService.getById: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Create category
  create: async (payload) => {
    try {
      console.log('CategoryService.create: Creating category:', payload);
      const response = await api.post('/categories', {
        Name: payload.name,
        Limit: payload.limit,
        Timeframe: payload.timeframe,
        ThresholdPercent: payload.thresholdPercent
      });
      console.log('CategoryService.create: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('CategoryService.create: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Update category
  update: async (id, payload) => {
    try {
      console.log('CategoryService.update: Updating category:', id, payload);
      const response = await api.put(`/categories/${id}`, {
        Id: id,
        Name: payload.name,
        Limit: payload.limit,
        Timeframe: payload.timeframe,
        ThresholdPercent: payload.thresholdPercent
      });
      console.log('CategoryService.update: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('CategoryService.update: Error:', error);
      throw error.response?.data || error;
    }
  },

  // Delete category
  delete: async (id) => {
    try {
      console.log('CategoryService.delete: Deleting category:', id);
      const response = await api.delete(`/categories/${id}`);
      console.log('CategoryService.delete: Response:', response.data);
      
      return {
        success: response.data?.Success ?? response.data?.success ?? true,
        message: response.data?.Message ?? response.data?.message ?? 'Category deleted successfully',
        data: response.data?.Data ?? response.data?.data ?? null,
        errors: response.data?.Errors ?? response.data?.errors ?? null
      };
    } catch (error) {
      console.error('CategoryService.delete: Error:', error);
      
      // Enhanced error handling for delete
      const errorResponse = error.response?.data;
      if (errorResponse) {
        throw {
          success: false,
          message: errorResponse.Message || errorResponse.message || 'Failed to delete category',
          errors: errorResponse.Errors || errorResponse.errors,
          status: error.response?.status
        };
      }
      throw error;
    }
  }
};

export default categoryService;
