import { apiClient } from './client';
import { NotificationItem } from '../../types';

export const notificationsApi = {
  async getNotifications(unreadOnly: boolean = false): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const query = unreadOnly ? '?unreadOnly=true' : '';
    const res = await apiClient<{
      success: boolean;
      count: number;
      unreadCount: number;
      data: any[];
    }>(`/notifications${query}`);

    const notifications: NotificationItem[] = (res.data || []).map((n) => ({
      id: n._id || n.notificationId,
      notificationId: n.notificationId,
      recipientRole: n.recipientRole,
      citizenId: n.citizenId,
      departmentId: n.departmentId,
      applicationId: n.applicationId,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      readAt: n.readAt,
      metadata: n.metadata,
      createdAt: n.createdAt,
    }));

    return {
      notifications,
      unreadCount: res.unreadCount ?? 0,
    };
  },

  async markAsRead(notificationId: string): Promise<NotificationItem> {
    const res = await apiClient<{ success: boolean; data: any }>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    const n = res.data;
    return {
      id: n._id || n.notificationId,
      notificationId: n.notificationId,
      recipientRole: n.recipientRole,
      citizenId: n.citizenId,
      departmentId: n.departmentId,
      applicationId: n.applicationId,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      readAt: n.readAt,
      metadata: n.metadata,
      createdAt: n.createdAt,
    };
  },

  async markAllAsRead(): Promise<{ updatedCount: number }> {
    const res = await apiClient<{ success: boolean; updatedCount: number }>('/notifications/read-all', {
      method: 'POST',
    });
    return {
      updatedCount: res.updatedCount ?? 0,
    };
  },
};
