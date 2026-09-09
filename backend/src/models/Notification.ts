import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'application_submitted'
  | 'status_change'
  | 'application_approved'
  | 'application_rejected'
  | 'consent_revoked'
  | 'document_verified'
  | 'document_rejected'
  | 'system';

export interface INotification extends Document {
  notificationId: string;
  recipientRole: 'citizen' | 'officer' | 'admin';
  citizenId?: string;
  departmentId?: string;
  applicationId?: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    notificationId: { type: String, required: true, unique: true, index: true },
    recipientRole: {
      type: String,
      enum: ['citizen', 'officer', 'admin'],
      required: true,
      index: true,
    },
    citizenId: { type: String, index: true },
    departmentId: { type: String, index: true },
    applicationId: { type: String, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'application_submitted',
        'status_change',
        'application_approved',
        'application_rejected',
        'consent_revoked',
        'document_verified',
        'document_rejected',
        'system',
      ],
      required: true,
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
