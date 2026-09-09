import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  activityId: string;
  citizenId: string;
  applicationId?: string;
  serviceName: string;
  departmentName: string;
  action: string;
  details: string;
  type:
    | 'submission'
    | 'document_access'
    | 'verification'
    | 'consent_grant'
    | 'consent_revoke'
    | 'status_change'
    | 'officer_remark'
    | 'document_requested'
    | 'document_fetched'
    | 'document_exchanged'
    | 'data_access_denied'
    | 'adapter_request'
    | 'adapter_response';
  statusBadge: string;
  timestamp: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    activityId: { type: String, required: true, unique: true, index: true },
    citizenId: { type: String, required: true, index: true },
    applicationId: { type: String, index: true },
    serviceName: { type: String, required: true },
    departmentName: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'submission',
        'document_access',
        'verification',
        'consent_grant',
        'consent_revoke',
        'status_change',
        'officer_remark',
        'document_requested',
        'document_fetched',
        'document_exchanged',
        'data_access_denied',
        'adapter_request',
        'adapter_response',
      ],
      required: true,
      index: true,
    },
    statusBadge: { type: String, required: true },
    timestamp: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
