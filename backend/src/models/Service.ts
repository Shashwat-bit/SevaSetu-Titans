import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  serviceId: string;
  title: string;
  departmentId: string;
  departmentName: string;
  category: 'scholarships' | 'certificates' | 'residence' | 'schemes' | 'transport' | 'welfare';
  categoryLabel: string;
  description: string;
  requiredDocs: string[];
  requiredFields: string[];
  processingDays: string;
  fee: string;
  eligibility: string;
  popular?: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    serviceId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    departmentId: { type: String, required: true, index: true },
    departmentName: { type: String, required: true },
    category: {
      type: String,
      enum: ['scholarships', 'certificates', 'residence', 'schemes', 'transport', 'welfare'],
      required: true,
    },
    categoryLabel: { type: String, required: true },
    description: { type: String, required: true },
    requiredDocs: [{ type: String }],
    requiredFields: [{ type: String }],
    processingDays: { type: String, required: true },
    fee: { type: String, required: true },
    eligibility: { type: String, required: true },
    popular: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service = mongoose.model<IService>('Service', ServiceSchema);
