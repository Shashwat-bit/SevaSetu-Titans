import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'citizen' | 'officer' | 'admin';

export interface IUser extends Document {
  citizenId: string; // Used as unique identifier across citizen applications/consents
  name: string;
  email: string;
  phone?: string;
  maskedAadhaar?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  isDigiLockerConnected: boolean;
  connectedAt?: string;
  role: UserRole;
  departmentId?: string; // Set for officers (e.g. 'dept-edu', 'dept-rev', 'dept-trans')
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    citizenId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    phone: { type: String, default: '' },
    maskedAadhaar: { type: String, default: '' },
    address: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, default: '' },
    isDigiLockerConnected: { type: Boolean, default: false },
    connectedAt: { type: String },
    role: {
      type: String,
      enum: ['citizen', 'officer', 'admin'],
      default: 'citizen',
      required: true,
      index: true,
    },
    departmentId: { type: String, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
