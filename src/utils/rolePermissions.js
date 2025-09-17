// User roles
export const USER_ROLES = {
    FINANCE_ADMIN: 1,
    DEPARTMENT_HEAD: 2,
    MANAGEMENT: 3
  };
  
  // Permissions
  export const PERMISSIONS = {
    // Dashboard permissions
    VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
    VIEW_DEPARTMENT_DASHBOARD: 'view_department_dashboard',
    VIEW_MANAGEMENT_DASHBOARD: 'view_management_dashboard',
    
    // Category permissions
    VIEW_CATEGORIES: 'view_categories',
    CREATE_CATEGORIES: 'create_categories',
    EDIT_CATEGORIES: 'edit_categories',
    DELETE_CATEGORIES: 'delete_categories',
    
    // Allocation permissions
    VIEW_ALLOCATIONS: 'view_allocations',
    CREATE_ALLOCATIONS: 'create_allocations',
    EDIT_ALLOCATIONS: 'edit_allocations',
    DELETE_ALLOCATIONS: 'delete_allocations',
    
    // Request permissions
    VIEW_REQUESTS: 'view_requests',
    CREATE_REQUESTS: 'create_requests',
    REVIEW_REQUESTS: 'review_requests',
    
    // Analytics permissions
    VIEW_ANALYTICS: 'view_analytics',
    
    // Report permissions
    VIEW_REPORTS: 'view_reports',
    GENERATE_REPORTS: 'generate_reports',
    
    // Notification permissions
    VIEW_NOTIFICATIONS: 'view_notifications'
  };
  
  // Role permission mapping
  const ROLE_PERMISSIONS = {
    [USER_ROLES.FINANCE_ADMIN]: [
      PERMISSIONS.VIEW_ADMIN_DASHBOARD,
      PERMISSIONS.VIEW_CATEGORIES,
      PERMISSIONS.CREATE_CATEGORIES,
      PERMISSIONS.EDIT_CATEGORIES,
      PERMISSIONS.DELETE_CATEGORIES,
      PERMISSIONS.VIEW_ALLOCATIONS,
      PERMISSIONS.CREATE_ALLOCATIONS,
      PERMISSIONS.EDIT_ALLOCATIONS,
      PERMISSIONS.DELETE_ALLOCATIONS,
      PERMISSIONS.VIEW_REQUESTS,
      PERMISSIONS.REVIEW_REQUESTS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.GENERATE_REPORTS,
      PERMISSIONS.VIEW_NOTIFICATIONS
    ],
    [USER_ROLES.DEPARTMENT_HEAD]: [
      PERMISSIONS.VIEW_DEPARTMENT_DASHBOARD,
      PERMISSIONS.VIEW_CATEGORIES,
      PERMISSIONS.VIEW_ALLOCATIONS,
      PERMISSIONS.VIEW_REQUESTS,
      PERMISSIONS.CREATE_REQUESTS,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.VIEW_NOTIFICATIONS
    ],
    [USER_ROLES.MANAGEMENT]: [
      PERMISSIONS.VIEW_MANAGEMENT_DASHBOARD,
      PERMISSIONS.VIEW_CATEGORIES,
      PERMISSIONS.VIEW_ALLOCATIONS,
      PERMISSIONS.VIEW_REQUESTS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.GENERATE_REPORTS,
      PERMISSIONS.VIEW_NOTIFICATIONS
    ]
  };
  
  // Check if user has permission
  export const hasPermission = (userRole, requiredPermissions) => {
    if (!userRole || !requiredPermissions) return false;
    
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];
    
    // If requiredPermissions is an array, check if user has any of them
    if (Array.isArray(requiredPermissions)) {
      return requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );
    }
    
    // If single permission, check directly
    return userPermissions.includes(requiredPermissions);
  };
  
  // Get all permissions for a role
  export const getRolePermissions = (userRole) => {
    return ROLE_PERMISSIONS[userRole] || [];
  };
  
  // Check if user can access a specific route
  export const canAccessRoute = (userRole, route) => {
    const routePermissions = {
      '/dashboard': [
        PERMISSIONS.VIEW_ADMIN_DASHBOARD,
        PERMISSIONS.VIEW_DEPARTMENT_DASHBOARD,
        PERMISSIONS.VIEW_MANAGEMENT_DASHBOARD
      ],
      '/categories': [PERMISSIONS.VIEW_CATEGORIES],
      '/allocations': [PERMISSIONS.VIEW_ALLOCATIONS],
      '/requests': [PERMISSIONS.VIEW_REQUESTS],
      '/analytics': [PERMISSIONS.VIEW_ANALYTICS],
      '/reports': [PERMISSIONS.VIEW_REPORTS],
      '/notifications': [PERMISSIONS.VIEW_NOTIFICATIONS]
    };
    
    const requiredPermissions = routePermissions[route];
    return requiredPermissions ? hasPermission(userRole, requiredPermissions) : false;
  };
  