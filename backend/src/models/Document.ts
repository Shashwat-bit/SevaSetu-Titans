import mongoose, { Schema, Document } from 'mongoose';

export interface ICitizenDocument extends Document {
  documentId: string;
  citizenId: string;
  name: string;
  docType: string;
  issuer: string;
  issueDate: string;
  docNumber: string;
  verified: boolean;
  category: 'identity' | 'education' | 'income' | 'address' | 'transport';
  source: string;
  verificationStatus: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CitizenDocumentSchema = new Schema<ICitizenDocument>(
  {
    documentId: { type: String, required: true, unique: true, index: true },
    citizenId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    docType: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String, required: true },
    docNumber: { type: String, required: true },
    verified: { type: Boolean, default: true },
    category: {
      type: String,
      enum: ['identity', 'education', 'income', 'address', 'transport'],
      required: true,
    },
    source: { type: String, default: 'MOCK_DIGILOCKER' },
    verificationStatus: { type: String, default: 'VERIFIED_MOCK' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const CitizenDocument = mongoose.model<ICitizenDocument>('CitizenDocument', CitizenDocumentSchema);
