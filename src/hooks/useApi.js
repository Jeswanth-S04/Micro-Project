import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    immediate = true,
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred'
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      
      if (result.success) {
        setData(result.data);
        if (showSuccessToast) {
          toast.success(result.message || successMessage);
        }
        if (onSuccess) {
          onSuccess(result.data, result);
        }
        return result;
      } else {
        throw new Error(result.message || errorMessage);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || errorMessage;
      setError(errorMsg);
      
      if (showErrorToast) {
        toast.error(errorMsg);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, errorMessage]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset
  };
};

export const useAsyncOperation = (options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred'
  } = options;

  const execute = useCallback(async (operation) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await operation();
      
      if (showSuccessToast) {
        toast.success(result?.message || successMessage);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || errorMessage;
      setError(errorMsg);
      
      if (showErrorToast) {
        toast.error(errorMsg);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccessToast, showErrorToast, successMessage, errorMessage]);

  return {
    loading,
    error,
    execute,
    setError
  };
};

export const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setPage(page - 1);
    }
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  const reset = () => {
    setPage(initialPage);
    setPageSize(initialPageSize);
    setTotal(0);
  };

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage: goToPage,
    setPageSize: changePageSize,
    setTotal,
    nextPage,
    prevPage,
    reset
  };
};
