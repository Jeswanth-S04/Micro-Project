import api from './api';

const normalise = (resp) => ({
  success: resp?.Success ?? false,
  message: resp?.Message ?? '',
  data: resp?.Data ?? [],
  errors: resp?.Errors ?? null
});

export const notificationService = {
  // Get my notifications
  getMyNotifications: async () => {
    try {
      console.log('🔍 NotificationService.getMyNotifications: Calling /notifications');
      const response = await api.get('/notifications');
      console.log('✅ NotificationService.getMyNotifications: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('❌ NotificationService.getMyNotifications: Error:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      console.log(`🔍 NotificationService.markAsRead: Calling /notifications/${id}/read`);
      const response = await api.post(`/notifications/${id}/read`);
      console.log('✅ NotificationService.markAsRead: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error(`❌ NotificationService.markAsRead: Error for ID ${id}:`, error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      console.log('🔍 NotificationService.markAllAsRead: Calling /notifications/mark-all-read');
      const response = await api.post('/notifications/mark-all-read');
      console.log('✅ NotificationService.markAllAsRead: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('❌ NotificationService.markAllAsRead: Error:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      console.log('🔍 NotificationService.getUnreadCount: Calling /notifications/unread-count');
      const response = await api.get('/notifications/unread-count');
      console.log('✅ NotificationService.getUnreadCount: Response:', response.data);
      return normalise(response.data);
    } catch (error) {
      console.error('❌ NotificationService.getUnreadCount: Error:', error);
      throw error;
    }
  }
};

export default notificationService;
