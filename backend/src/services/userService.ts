import { User, IUser } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { Activity } from '../models/Activity';

export class UserService {
  async getCurrentUser(citizenId: string): Promise<Partial<IUser>> {
    const user = await User.findOne({ citizenId }).select('-passwordHash');
    if (!user) {
      throw new AppError(`User with ID ${citizenId} not found.`, 404);
    }
    return user;
  }

  async connectDigiLocker(citizenId: string): Promise<Partial<IUser>> {
    const user = await User.findOne({ citizenId });
    if (!user) {
      throw new AppError(`User with ID ${citizenId} not found.`, 404);
    }

    user.isDigiLockerConnected = true;
    user.connectedAt = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    await user.save();

    // Log Activity
    await Activity.create({
      activityId: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      citizenId: user.citizenId,
      serviceName: 'DigiLocker Interoperability Adapter',
      departmentName: 'DigiLocker (Mock Node)',
      action: 'DigiLocker account linked successfully',
      details: 'Mock adapter connected with Aadhaar, Marksheet, and Address verified credentials',
      type: 'consent_grant',
      statusBadge: 'Connected',
      timestamp: user.connectedAt,
    });

    return User.findOne({ citizenId }).select('-passwordHash') as any;
  }

  async disconnectDigiLocker(citizenId: string): Promise<Partial<IUser>> {
    const user = await User.findOne({ citizenId });
    if (!user) {
      throw new AppError(`User with ID ${citizenId} not found.`, 404);
    }

    user.isDigiLockerConnected = false;
    await user.save();

    const nowFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Log Activity
    await Activity.create({
      activityId: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      citizenId: user.citizenId,
      serviceName: 'DigiLocker Interoperability Adapter',
      departmentName: 'DigiLocker (Mock Node)',
      action: 'DigiLocker account disconnected',
      details: 'Digital credentials link removed from SevaSetu session',
      type: 'consent_revoke',
      statusBadge: 'Disconnected',
      timestamp: nowFormatted,
    });

    return User.findOne({ citizenId }).select('-passwordHash') as any;
  }
}

export const userService = new UserService();
