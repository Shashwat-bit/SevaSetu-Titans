import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  departmentId: string;
  name: string;
  code: string;
  shortName: string;
  category: string;
  description: string;
  adapterStatus: string;
  adapterIdentifier: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    departmentId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    shortName: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    adapterStatus: { type: String, default: 'Connected (Mock Adapter)' },
    adapterIdentifier: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
