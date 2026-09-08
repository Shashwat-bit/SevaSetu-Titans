import mongoose, { Schema, Document } from 'mongoose';

export interface IConsent extends Document {
  consentId: string;
  citizenId: string;
  departmentId: string;
  whoHasAccess: string;
  whatData: string[];
  whyPurpose: string;
  whichApplicationId: string;
  whichServiceName: string;
  fromWhen: string;
  untilWhen: string;
  status: 'Active' | 'Access Revoked' | 'Expired';
  revokedAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentSchema = new Schema<IConsent>(
  {
    consentId: { type: String, required: true, unique: true, index: true },
    citizenId: { type: String, required: true, index: true },
    departmentId: { type: String, required: true, index: true },
    whoHasAccess: { type: String, required: true },
    whatData: [{ type: String, required: true }],
    whyPurpose: { type: String, required: true },
    whichApplicationId: { type: String, required: true, index: true },
    whichServiceName: { type: String, required: true },
    fromWhen: { type: String, required: true },
    untilWhen: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'Access Revoked', 'Expired'],
      default: 'Active',
      index: true,
    },
    revokedAt: { type: String },
  },
  { timestamps: true }
);

export const Consent = mongoose.model<IConsent>('Consent', ConsentSchema);
