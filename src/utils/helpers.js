// Format currency
export const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return '$0.00';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(amount));
  };
  
  // Format date
  export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  // Format percentage
  export const formatPercentage = (value) => {
    if (value == null || isNaN(value)) return '0%';
    return `${Math.round(Number(value))}%`;
  };
  
  // Format number
  export const formatNumber = (value) => {
    if (value == null || isNaN(value)) return '0';
    return new Intl.NumberFormat('en-US').format(Number(value));
  };
  
  // Truncate text
  export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Get status color
  export const getStatusColor = (status) => {
    const colors = {
      0: 'warning',   // Pending
      1: 'success',   // Approved  
      2: 'danger',    // Rejected
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'danger',
      'active': 'success',
      'inactive': 'secondary'
    };
    return colors[status] || 'secondary';
  };
  
  // Get utilization color
  export const getUtilizationColor = (percentage) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 90) return 'warning';
    if (percentage >= 75) return 'info';
    return 'success';
  };
  
  // Calculate percentage
  export const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };
  
  // Validate email
  export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Generate random ID
  export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  // Debounce function
  export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  