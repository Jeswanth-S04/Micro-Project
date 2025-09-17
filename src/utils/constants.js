export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5022/api';

export const USER_ROLES = {
  FINANCE_ADMIN: 1,
  DEPARTMENT_HEAD: 2,
  MANAGEMENT: 3
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.FINANCE_ADMIN]: 'Finance Admin',
  [USER_ROLES.DEPARTMENT_HEAD]: 'Department Head',
  [USER_ROLES.MANAGEMENT]: 'Management'
};

export const REQUEST_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2
};

export const REQUEST_STATUS_LABELS = {
  [REQUEST_STATUS.PENDING]: 'Pending',
  [REQUEST_STATUS.APPROVED]: 'Approved',
  [REQUEST_STATUS.REJECTED]: 'Rejected'
};

// ADD THIS - Missing TIMEFRAMES constant
export const TIMEFRAMES = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Yearly', label: 'Yearly' },
  { value: 'Semi-Annual', label: 'Semi-Annual' },
  { value: 'Annual', label: 'Annual' }
];

export const ALERT_TYPES = {
  THRESHOLD: 'threshold',
  EXCEEDED: 'exceeded',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const CHART_COLORS = [
  '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', 
  '#6610f2', '#e83e8c', '#fd7e14', '#20c997', '#6f42c1'
];

// SignalR Hub URL
export const SIGNALR_HUB_URL = process.env.REACT_APP_SIGNALR_URL || 'http://localhost:5022/hubs/budget';

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'budget_token',
  USER: 'budget_user',
  THEME: 'budget_theme'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm'
};

// Currency format
export const CURRENCY = {
  LOCALE: 'en-US',
  CURRENCY_CODE: 'USD'
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Budget thresholds
export const BUDGET_THRESHOLDS = {
  WARNING: 75,
  DANGER: 90,
  CRITICAL: 100
};
