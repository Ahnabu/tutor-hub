import jwt from 'jsonwebtoken';
import { Tuition, ITuition } from '../models/Tuition.js';
import { SessionLog } from '../models/SessionLog.js';
import { User, IUser } from '../models/User.js';
import { env } from '../config/env.js';
import { sha256, verifyPassword } from '../utils/crypto.js';
import { VerificationStatus } from '../enums/index.js';
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '../utils/errors.js';

export interface GuardianViewSessionPayload {
  tuitionId: string;
  role: 'GUARDIAN_VIEWER';
}

export class GuardianService {
  /**
   * Verifies the PIN for a shared tuition link and issues a 7-day view session token
   */
  static async verifyPin(rawToken: string, pin: string): Promise<{ viewToken: string; tuitionId: string }> {
    const tokenHash = sha256(rawToken);
    const tuition = await Tuition.findOne({
      'guardianAccess.shareTokenHash': tokenHash,
      deletedAt: { $exists: false },
    });

    if (!tuition) {
      throw new NotFoundError('Tuition tracking link not found or has been revoked');
    }

    if (tuition.guardianAccess.shareEnabled === false) {
      throw new ForbiddenError('This tracking link has been disabled by the tutor');
    }

    // Check lock
    if (
      tuition.guardianAccess.pinLockedUntil &&
      tuition.guardianAccess.pinLockedUntil > new Date()
    ) {
      throw new ForbiddenError(
        'Too many failed attempts. This link is temporarily locked for 15 minutes.'
      );
    }

    if (tuition.guardianAccess.accessPinHash) {
      const isMatch = await verifyPassword(tuition.guardianAccess.accessPinHash, pin);
      if (!isMatch) {
        tuition.guardianAccess.pinFailedAttempts =
          (tuition.guardianAccess.pinFailedAttempts || 0) + 1;
        if (tuition.guardianAccess.pinFailedAttempts >= 5) {
          tuition.guardianAccess.pinLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        }
        await tuition.save();
        throw new UnauthorizedError('Incorrect PIN. Please ask the tutor for the correct PIN.');
      }

      // Reset failed attempts on success
      tuition.guardianAccess.pinFailedAttempts = 0;
      tuition.guardianAccess.pinLockedUntil = undefined;
      await tuition.save();
    }

    // Issue JWT view token
    const viewToken = jwt.sign(
      { tuitionId: tuition._id.toString(), role: 'GUARDIAN_VIEWER' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '7d' }
    );

    return {
      viewToken,
      tuitionId: tuition._id.toString(),
    };
  }

  /**
   * Retrieves sanitized, read-only tuition details for guardian viewing
   */
  static async getTuitionByShareToken(
    rawToken: string,
    viewSessionToken?: string
  ): Promise<{
    requiresPin: boolean;
    tuition?: Record<string, unknown>;
  }> {
    const tokenHash = sha256(rawToken);
    const tuition = await Tuition.findOne({
      'guardianAccess.shareTokenHash': tokenHash,
      deletedAt: { $exists: false },
    });

    if (!tuition) {
      throw new NotFoundError('Tuition tracking link not found or has expired');
    }

    if (tuition.guardianAccess.shareEnabled === false) {
      throw new ForbiddenError('This tracking link has been disabled by the tutor');
    }

    // If PIN is configured, verify session
    if (tuition.guardianAccess.accessPinHash) {
      if (!viewSessionToken) {
        return { requiresPin: true };
      }

      try {
        const decoded = jwt.verify(
          viewSessionToken,
          env.JWT_ACCESS_SECRET
        ) as GuardianViewSessionPayload;
        if (decoded.tuitionId !== tuition._id.toString() || decoded.role !== 'GUARDIAN_VIEWER') {
          return { requiresPin: true };
        }
      } catch {
        return { requiresPin: true };
      }
    }

    // Load recent session logs (guardian visible only)
    const sessions = await SessionLog.find({
      tuitionId: tuition._id,
      isDeleted: false,
    })
      .sort({ sessionDate: -1 })
      .limit(30)
      .lean();

    const sanitizedSessions = sessions.map((s) => ({
      id: s._id.toString(),
      sessionDate: s.sessionDate.toISOString(),
      durationMinutes: s.durationMinutes,
      entries: s.entries.map((e) => ({
        subject: e.subject,
        attendance: e.attendance,
        topicsTaught: e.topicsTaught,
        homeworkAssigned: e.homeworkAssigned,
        previousHomeworkStatus: e.previousHomeworkStatus,
      })),
      guardianVisibleRemarks: s.guardianVisibleRemarks,
    }));

    // Load teacher public details
    const teacher = await User.findById(tuition.teacherId).lean();

    return {
      requiresPin: false,
      tuition: {
        id: tuition._id.toString(),
        title: tuition.title,
        students: tuition.students,
        scheduleConfig: {
          billingModel: tuition.scheduleConfig.billingModel,
          targetDaysPerCycle: tuition.scheduleConfig.targetDaysPerCycle,
          weeklyDays: tuition.scheduleConfig.weeklyDays,
          durationMinutes: tuition.scheduleConfig.durationMinutes,
        },
        currentCycle: {
          cycleNumber: tuition.currentCycle.cycleNumber,
          completedDays: tuition.currentCycle.completedDays,
          extraClassesCount: tuition.currentCycle.extraClassesCount,
          cycleStartDate: tuition.currentCycle.cycleStartDate.toISOString(),
          monthlyFee: tuition.currentCycle.monthlyFee,
          paymentStatus: tuition.currentCycle.paymentStatus,
          amountPaid: tuition.currentCycle.amountPaid,
        },
        payments: tuition.payments.map((p) => ({
          amount: p.amount,
          method: p.method,
          paidAt: p.paidAt.toISOString(),
          reference: p.reference,
        })),
        recentSessions: sanitizedSessions,
        teacher: teacher
          ? {
              name: teacher.name,
              avatarUrl: teacher.avatarUrl,
              institution: teacher.teacherProfile?.institution,
              isVerified: teacher.teacherProfile?.verificationStatus === VerificationStatus.VERIFIED,
            }
          : { name: 'Verified Tutor', isVerified: true },
      },
    };
  }

  /**
   * Retrieves all tuitions linked to a claimed guardian account
   */
  static async getClaimedGuardianTuitions(user: IUser): Promise<Record<string, unknown>[]> {
    const userIds = [user._id];

    // Also link any shadow accounts created with guardian's phone or email
    const shadowAccounts = await User.find({
      $or: [
        ...(user.phone ? [{ phone: user.phone }] : []),
        ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
      ],
    }).select('_id');
    shadowAccounts.forEach((acc) => userIds.push(acc._id));

    const tuitions = await Tuition.find({
      'guardianAccess.guardianUserId': { $in: userIds },
      deletedAt: { $exists: false },
    })
      .sort({ updatedAt: -1 })
      .lean();

    const teacherIds = [...new Set(tuitions.map((t) => t.teacherId.toString()))];
    const teachers = await User.find({ _id: { $in: teacherIds } }).lean();
    const teacherMap = new Map(teachers.map((t) => [t._id.toString(), t]));

    return tuitions.map((t) => {
      const teacher = teacherMap.get(t.teacherId.toString());
      return {
        id: t._id.toString(),
        title: t.title,
        students: t.students,
        scheduleConfig: {
          targetDaysPerCycle: t.scheduleConfig.targetDaysPerCycle,
          weeklyDays: t.scheduleConfig.weeklyDays,
        },
        currentCycle: {
          cycleNumber: t.currentCycle.cycleNumber,
          completedDays: t.currentCycle.completedDays,
          monthlyFee: t.currentCycle.monthlyFee,
          amountPaid: t.currentCycle.amountPaid,
          paymentStatus: t.currentCycle.paymentStatus,
        },
        teacher: teacher
          ? {
              id: teacher._id.toString(),
              name: teacher.name,
              avatarUrl: teacher.avatarUrl,
              institution: teacher.teacherProfile?.institution,
              isVerified: teacher.teacherProfile?.verificationStatus === VerificationStatus.VERIFIED,
            }
          : { name: 'Verified Tutor', isVerified: true },
      };
    });
  }
}
