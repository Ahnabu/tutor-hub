import mongoose from 'mongoose';
import { User, IUser } from '../models/User.js';
import { TeacherPrivateProfile } from '../models/TeacherPrivateProfile.js';
import { Tuition } from '../models/Tuition.js';
import { SessionLog } from '../models/SessionLog.js';
import { MarketplacePost } from '../models/MarketplacePost.js';
import { SystemConfig, ISystemConfig } from '../models/SystemConfig.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import {
  UserRole,
  VerificationStatus,
  TuitionStatus,
  MarketplacePostStatus,
  AuditAction,
  NotificationType,
} from '../enums/index.js';
import { ReviewVerificationInput, UpdateSystemConfigInput } from '../schemas/admin.schema.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export class AdminService {
  /**
   * Get high-level platform KPI statistics
   */
  static async getPlatformStats(): Promise<Record<string, number>> {
    const [
      totalUsers,
      totalTeachers,
      verifiedTeachers,
      pendingVerifications,
      totalGuardians,
      totalTuitions,
      activeTuitions,
      totalSessions,
      openMarketplacePosts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ roles: UserRole.TEACHER }),
      User.countDocuments({
        roles: UserRole.TEACHER,
        'teacherProfile.verificationStatus': VerificationStatus.VERIFIED,
      }),
      User.countDocuments({
        roles: UserRole.TEACHER,
        'teacherProfile.verificationStatus': VerificationStatus.PENDING,
      }),
      User.countDocuments({ roles: UserRole.GUARDIAN }),
      Tuition.countDocuments(),
      Tuition.countDocuments({
        status: TuitionStatus.ACTIVE,
        deletedAt: { $exists: false },
      }),
      SessionLog.countDocuments({ deletedAt: { $exists: false } }),
      MarketplacePost.countDocuments({
        status: MarketplacePostStatus.OPEN,
        deletedAt: { $exists: false },
      }),
    ]);

    return {
      totalUsers,
      totalTeachers,
      verifiedTeachers,
      pendingVerifications,
      totalGuardians,
      totalTuitions,
      activeTuitions,
      totalSessions,
      openMarketplacePosts,
    };
  }

  /**
   * Get list of teachers pending credential verification review
   */
  static async getPendingVerifications(): Promise<Array<Record<string, unknown>>> {
    const pendingTeachers = await User.find({
      roles: UserRole.TEACHER,
      'teacherProfile.verificationStatus': VerificationStatus.PENDING,
    })
      .select('name email phone teacherProfile createdAt avatarUrl')
      .sort({ updatedAt: -1 })
      .lean();

    const userIds = pendingTeachers.map((t) => t._id);
    const privateProfiles = await TeacherPrivateProfile.find({
      userId: { $in: userIds },
    }).lean();

    const docMap = new Map(privateProfiles.map((p) => [p.userId.toString(), p.verificationDocs]));

    return pendingTeachers.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      email: t.email,
      phone: t.phone,
      avatarUrl: t.avatarUrl,
      institution: t.teacherProfile?.institution,
      department: t.teacherProfile?.department,
      batchOrYear: t.teacherProfile?.batchOrYear,
      experienceYears: t.teacherProfile?.experienceYears,
      bio: t.teacherProfile?.bio,
      subjectsOffered: t.teacherProfile?.subjectsOffered,
      verificationStatus: t.teacherProfile?.verificationStatus,
      verificationDocs: docMap.get(t._id.toString()) || [],
      createdAt: t.createdAt,
    }));
  }

  /**
   * Review teacher verification submission (Approve or Reject)
   */
  static async reviewVerification(
    adminId: string,
    teacherId: string,
    input: ReviewVerificationInput
  ): Promise<Record<string, unknown>> {
    const teacher = await User.findById(teacherId);
    if (!teacher || !teacher.roles.includes(UserRole.TEACHER)) {
      throw new NotFoundError('Teacher profile not found');
    }

    if (!teacher.teacherProfile) {
      throw new BadRequestError('Teacher profile has not been initialized');
    }

    const previousStatus = teacher.teacherProfile.verificationStatus;

    if (input.action === 'APPROVE') {
      teacher.teacherProfile.verificationStatus = VerificationStatus.VERIFIED;
      teacher.teacherProfile.verificationRejectionReason = undefined;
    } else {
      teacher.teacherProfile.verificationStatus = VerificationStatus.REJECTED;
      teacher.teacherProfile.verificationRejectionReason =
        input.rejectionReason || 'Submitted credentials do not match official university records.';
    }

    await teacher.save();

    // Log admin audit event
    await AuditLog.create({
      actorId: new mongoose.Types.ObjectId(adminId),
      targetId: teacher._id.toString(),
      targetType: 'User',
      action: AuditAction.TEACHER_VERIFICATION_REVIEWED,
      metadata: {
        action: input.action,
        previousStatus,
        newStatus: teacher.teacherProfile.verificationStatus,
        rejectionReason: input.rejectionReason,
      },
    });

    // Notify teacher
    await Notification.create({
      userId: teacher._id,
      type: NotificationType.VERIFICATION_RESULT,
      title:
        input.action === 'APPROVE'
          ? 'Profile Verified! 🏅'
          : 'Profile Verification Update',
      body:
        input.action === 'APPROVE'
          ? 'Congratulations! Your teacher profile has been officially verified by the TutorHub admin team.'
          : `Your verification request was not approved: ${input.rejectionReason || 'Please resubmit valid credentials.'}`,
      data: {
        status: teacher.teacherProfile.verificationStatus,
      },
    });

    return {
      teacherId: teacher._id.toString(),
      status: teacher.teacherProfile.verificationStatus,
      rejectionReason: teacher.teacherProfile.verificationRejectionReason,
    };
  }

  /**
   * Audit and inspect all tuitions
   */
  static async getTuitionAudits(page = 1, limit = 20): Promise<{
    tuitions: Array<Record<string, unknown>>;
    total: number;
  }> {
    const skip = (Math.max(1, page) - 1) * Math.min(50, limit);

    const [tuitions, total] = await Promise.all([
      Tuition.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('teacherId', 'name email phone avatarUrl')
        .populate('guardianAccess.guardianUserId', 'name email phone')
        .lean(),
      Tuition.countDocuments(),
    ]);

    const formatted = tuitions.map((t) => {
      const teacher = t.teacherId as unknown as IUser;
      const guardian = t.guardianAccess?.guardianUserId as unknown as IUser;
      return {
        id: t._id.toString(),
        title: t.title,
        status: t.status,
        students: t.students,
        billingModel: t.scheduleConfig?.billingModel,
        agreedFee: t.currentCycle?.monthlyFee,
        monthlyTargetDays: t.scheduleConfig?.targetDaysPerCycle,
        currentCycle: {
          cycleNumber: t.currentCycle?.cycleNumber,
          completedDays: t.currentCycle?.completedDays,
          paymentStatus: t.currentCycle?.paymentStatus,
          startDate: t.currentCycle?.cycleStartDate,
        },
        teacher: {
          id: teacher?._id?.toString(),
          name: teacher?.name,
          email: teacher?.email,
          phone: teacher?.phone,
        },
        guardian: {
          id: guardian?._id?.toString(),
          name: guardian?.name || t.guardianAccess?.guardianLabel,
          phone: guardian?.phone,
          email: guardian?.email,
          label: t.guardianAccess?.guardianLabel,
        },
        createdAt: t.createdAt,
      };
    });

    return { tuitions: formatted, total };
  }

  /**
   * Get or create SystemConfig
   */
  static async getSystemConfig(): Promise<ISystemConfig> {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }
    return config;
  }

  /**
   * Update SystemConfig
   */
  static async updateSystemConfig(
    adminId: string,
    input: UpdateSystemConfigInput
  ): Promise<ISystemConfig> {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }

    if (input.maintenanceMode !== undefined) {
      config.maintenanceMode = input.maintenanceMode;
    }
    if (input.requireAdminApprovalForPosts !== undefined) {
      config.requireAdminApprovalForPosts = input.requireAdminApprovalForPosts;
    }
    if (input.forceManualApproval !== undefined) {
      config.forceManualApproval = input.forceManualApproval;
    }
    if (input.contactRequestDailyLimit !== undefined) {
      config.contactRequestDailyLimit = input.contactRequestDailyLimit;
    }
    config.updatedBy = new mongoose.Types.ObjectId(adminId);
    await config.save();

    await AuditLog.create({
      actorId: new mongoose.Types.ObjectId(adminId),
      action: AuditAction.SYSTEM_CONFIG_UPDATED,
      metadata: input,
    });

    return config;
  }

  /**
   * Get recent platform audit logs
   */
  static async getRecentAuditLogs(limit = 30): Promise<Array<Record<string, unknown>>> {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actorId', 'name email roles')
      .lean();

    return logs.map((log) => {
      const actor = log.actorId as unknown as IUser;
      return {
        id: log._id.toString(),
        action: log.action,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
        actor: {
          id: actor?._id?.toString(),
          name: actor?.name,
          email: actor?.email,
        },
        targetId: log.targetId,
      };
    });
  }
}
