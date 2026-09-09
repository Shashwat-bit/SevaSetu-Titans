import { Notification, INotification, NotificationType } from '../models/Notification';
import { AuthTokenPayload } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export interface CreateNotificationDto {
  recipientRole: 'citizen' | 'officer' | 'admin';
  citizenId?: string;
  departmentId?: string;
  applicationId?: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}

export class NotificationService {
  async createNotification(dto: CreateNotificationDto): Promise<INotification> {
    const notificationId = `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    return Notification.create({
      notificationId,
      recipientRole: dto.recipientRole,
      citizenId: dto.citizenId,
      departmentId: dto.departmentId,
      applicationId: dto.applicationId,
      title: dto.title,
      message: dto.message,
      type: dto.type,
      isRead: false,
      metadata: dto.metadata || {},
    });
  }

  async getNotifications(
    user: AuthTokenPayload,
    unreadOnly: boolean = false
  ): Promise<{ notifications: INotification[]; unreadCount: number }> {
    const filter: Record<string, any> = {};

    if (user.role === 'citizen') {
      filter.citizenId = user.citizenId;
      filter.recipientRole = 'citizen';
    } else if (user.role === 'officer') {
      if (!user.departmentId) {
        throw new AppError('Officer has no assigned department.', 403);
      }
      filter.recipientRole = 'officer';
      filter.departmentId = user.departmentId;
    } else if (user.role === 'admin') {
      // Admin sees all notifications or admin-targeted notifications
      filter.$or = [{ recipientRole: 'admin' }, { recipientRole: { $exists: true } }];
    }

    const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

    if (unreadOnly) {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(100);

    return { notifications, unreadCount };
  }

  async markAsRead(notificationId: string, user: AuthTokenPayload): Promise<INotification> {
    const notification = await Notification.findOne({ notificationId });
    if (!notification) {
      throw new AppError(`Notification ${notificationId} not found`, 404);
    }

    // Strict ownership / department authorization check
    if (user.role === 'citizen') {
      if (notification.recipientRole !== 'citizen' || notification.citizenId !== user.citizenId) {
        throw new AppError('Forbidden. You may only manage your own notifications.', 403);
      }
    } else if (user.role === 'officer') {
      if (notification.recipientRole !== 'officer' || notification.departmentId !== user.departmentId) {
        throw new AppError(
          `Forbidden. You may only manage notifications for department ${user.departmentId}.`,
          403
        );
      }
    }

    notification.isRead = true;
    notification.readAt = new Date().toISOString();
    await notification.save();

    return notification;
  }

  async markAllAsRead(user: AuthTokenPayload): Promise<{ updatedCount: number }> {
    const filter: Record<string, any> = { isRead: false };

    if (user.role === 'citizen') {
      filter.citizenId = user.citizenId;
      filter.recipientRole = 'citizen';
    } else if (user.role === 'officer') {
      if (!user.departmentId) {
        throw new AppError('Officer has no assigned department.', 403);
      }
      filter.recipientRole = 'officer';
      filter.departmentId = user.departmentId;
    } else if (user.role === 'admin') {
      filter.recipientRole = 'admin';
    }

    const result = await Notification.updateMany(filter, {
      $set: { isRead: true, readAt: new Date().toISOString() },
    });

    return { updatedCount: result.modifiedCount };
  }
}

export const notificationService = new NotificationService();
