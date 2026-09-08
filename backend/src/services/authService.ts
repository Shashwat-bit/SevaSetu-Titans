import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { ENV } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { AuthTokenPayload } from '../middleware/authMiddleware';

export interface SanitizedUser {
  id: string;
  citizenId: string;
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
  departmentId?: string;
}

export class AuthService {
  public sanitizeUser(user: IUser): SanitizedUser {
    return {
      id: user._id.toString(),
      citizenId: user.citizenId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      maskedAadhaar: user.maskedAadhaar,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      isDigiLockerConnected: user.isDigiLockerConnected,
      connectedAt: user.connectedAt,
      role: user.role,
      departmentId: user.departmentId,
    };
  }

  public generateToken(user: IUser): string {
    const userIdStr = user._id.toString();
    const payload: AuthTokenPayload = {
      userId: userIdStr,
      id: userIdStr,
      citizenId: user.citizenId,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    };

    const options: SignOptions = {
      expiresIn: ENV.JWT_EXPIRES_IN as any,
    };

    return jwt.sign(payload, ENV.JWT_SECRET, options);
  }

  async login(email: string, password: string): Promise<{ token: string; user: SanitizedUser }> {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user);
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async demoSwitch(personaKey: string): Promise<{ token: string; user: SanitizedUser; message: string }> {
    // Map of demo personas to their seeded citizenId or email
    const personaMap: Record<string, string> = {
      citizen: 'cit-001',
      'officer-edu': 'officer-edu-001',
      'officer-rev': 'officer-rev-001',
      'officer-trans': 'officer-trans-001',
      admin: 'admin-001',
    };

    const citizenId = personaMap[personaKey.toLowerCase()] || personaKey;

    const user = await User.findOne({ citizenId });
    if (!user) {
      throw new AppError(`Demo persona '${personaKey}' not found. Please reseed database.`, 404);
    }

    const token = this.generateToken(user);
    return {
      token,
      user: this.sanitizeUser(user),
      message: `Switched demo persona to ${user.name} (${user.role.toUpperCase()}) [DEMO ONLY]`,
    };
  }

  async getCurrentUser(citizenId: string): Promise<SanitizedUser> {
    const user = await User.findOne({ citizenId });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
