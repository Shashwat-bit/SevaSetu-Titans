import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  citizenId: string;
  name: string;
  email: string;
  phone: string;
  maskedAadhaar: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  isDigiLockerConnected: boolean;
  connectedAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    citizenId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    maskedAadhaar: { type: String, required: true },
    address: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, required: true },
    isDigiLockerConnected: { type: Boolean, default: false },
    connectedAt: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
