import mongoose, { Schema, Document } from 'mongoose';

export interface ITimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

export interface IAttachedDocument {
  name: string;
  docType: string;
  source: string;
  verified: boolean;
  docNumber?: string;
}

export interface IPrefilledField {
  value: string;
  source: string;
  verified: boolean;
}

export interface IApplication extends Document {
  applicationId: string; // e.g. "SS-2026-001024"
  citizenId: string;
  citizenName: string;
  serviceId: string;
  serviceName: string;
  departmentId: string;
  departmentName: string;
  status: string; // 'Submitted' | 'Under Verification' | 'Under Review' | 'Approved' | 'Rejected'
  submittedAt: string;
  prefilledFields: Record<string, IPrefilledField>;
  userFields: Record<string, string>;
  documentsAttached: IAttachedDocument[];
  timeline: ITimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema = new Schema<ITimelineEvent>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    timestamp: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['completed', 'current', 'pending'], required: true },
  },
  { _id: false }
);

const AttachedDocumentSchema = new Schema<IAttachedDocument>(
  {
    name: { type: String, required: true },
    docType: { type: String, required: true },
    source: { type: String, required: true },
    verified: { type: Boolean, default: true },
    docNumber: { type: String },
  },
  { _id: false }
);

const ApplicationSchema = new Schema<IApplication>(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    citizenId: { type: String, required: true, index: true },
    citizenName: { type: String, required: true },
    serviceId: { type: String, required: true, index: true },
    serviceName: { type: String, required: true },
    departmentId: { type: String, required: true, index: true },
    departmentName: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: 'Submitted',
    },
    submittedAt: { type: String, required: true },
    prefilledFields: { type: Schema.Types.Mixed, default: {} },
    userFields: { type: Schema.Types.Mixed, default: {} },
    documentsAttached: [AttachedDocumentSchema],
    timeline: [TimelineEventSchema],
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
