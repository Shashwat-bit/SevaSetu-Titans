import mongoose, { Schema, Document } from 'mongoose';

export type DataExchangeStatus =
  | 'REQUESTED'
  | 'AUTHORIZED'
  | 'FETCHED'
  | 'VERIFIED'
  | 'DENIED'
  | 'FAILED';

export interface IDataExchange extends Document {
  exchangeId: string;
  applicationId: string;
  citizenId: string;
  documentId: string;
  documentType: string;
  normalizedType: string;
  sourceSystem: string;
  targetDepartment: string;
  purpose: string;
  consentId?: string;
  requestedAt: string;
  accessedAt?: string;
  status: DataExchangeStatus;
  requestedBy: string;
  requestedByName: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DataExchangeSchema = new Schema<IDataExchange>(
  {
    exchangeId: { type: String, required: true, unique: true, index: true },
    applicationId: { type: String, required: true, index: true },
    citizenId: { type: String, required: true, index: true },
    documentId: { type: String, required: true, index: true },
    documentType: { type: String, required: true },
    normalizedType: { type: String, required: true },
    sourceSystem: { type: String, required: true, default: 'DigiLocker Mock Adapter (Demo)' },
    targetDepartment: { type: String, required: true, index: true },
    purpose: { type: String, required: true },
    consentId: { type: String, index: true },
    requestedAt: { type: String, required: true },
    accessedAt: { type: String },
    status: {
      type: String,
      enum: ['REQUESTED', 'AUTHORIZED', 'FETCHED', 'VERIFIED', 'DENIED', 'FAILED'],
      default: 'FETCHED',
      index: true,
    },
    requestedBy: { type: String, required: true },
    requestedByName: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const DataExchange = mongoose.model<IDataExchange>('DataExchange', DataExchangeSchema);
