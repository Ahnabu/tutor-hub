import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  User,
  TeacherPrivateProfile,
  RefreshSession,
  Tuition,
  SessionLog,
  CycleHistory,
  ContactAccessRequest,
  ContactGrant,
  MarketplacePost,
  EmailOutbox,
  AuditLog,
  Notification,
  SystemConfig,
} from '../models/index.js';
import {
  UserRole,
  AccountStatus,
  BillingModel,
  TuitionStatus,
  SessionType,
  AttendanceStatus,
  EmailOutboxStatus,
  AuditAction,
  NotificationType,
  MarketplaceAuthorRole,
  MarketplaceModerationStatus,
  MarketplacePostStatus,
  ContactGrantSource,
} from '../enums/index.js';

describe('Mongoose Models & Schemas Unit Verification', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('creates a User with sensitive fields select:false', async () => {
    const user = await User.create({
      name: 'Rahim Ahmed',
      email: 'rahim@tutorhub.local',
      passwordHash: 'secret_hash_value',
      roles: [UserRole.TEACHER],
      accountStatus: AccountStatus.ACTIVE,
      isEmailVerified: true,
      tokenVersion: 1,
    });

    expect(user._id).toBeDefined();

    // Query back from DB without explicit select
    const fetched = await User.findById(user._id);
    expect(fetched).toBeDefined();
    expect(fetched?.name).toBe('Rahim Ahmed');
    // passwordHash must not be selected by default
    expect(fetched?.passwordHash).toBeUndefined();

    // Query with select('+passwordHash')
    const withSecret = await User.findById(user._id).select('+passwordHash');
    expect(withSecret?.passwordHash).toBe('secret_hash_value');
  });

  it('creates an isolated TeacherPrivateProfile (D5)', async () => {
    const userId = new mongoose.Types.ObjectId();
    const profile = await TeacherPrivateProfile.create({
      userId,
      whatsapp: '+8801700000000',
      fullAddress: 'Dhanmondi, Dhaka',
      verificationDocs: [
        {
          url: 'https://cloudinary.com/doc.pdf',
          publicId: 'tutorhub/docs/doc1',
          docType: 'NID',
          uploadedAt: new Date(),
        },
      ],
    });

    expect(profile._id).toBeDefined();
    expect(profile.userId.toString()).toBe(userId.toString());
    expect(profile.verificationDocs.length).toBe(1);
  });

  it('creates a RefreshSession with TTL and family tracking', async () => {
    const session = await RefreshSession.create({
      userId: new mongoose.Types.ObjectId(),
      familyId: 'family-123',
      tokenHash: 'hashed_refresh_token_string',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip: '127.0.0.1',
    });

    expect(session.familyId).toBe('family-123');
    expect(session.tokenHash).toBe('hashed_refresh_token_string');
  });

  it('creates a Tuition with optimistic version key', async () => {
    const tuition = await Tuition.create({
      teacherId: new mongoose.Types.ObjectId(),
      title: 'HSC Physics - Ahsan',
      students: [
        {
          name: 'Ahsan Khan',
          classGrade: 'Class 12',
          subjects: ['Physics'],
          isActive: true,
        },
      ],
      scheduleConfig: {
        billingModel: BillingModel.MONTHLY_CYCLE,
        targetDaysPerCycle: 12,
        weeklyDays: [],
        extraClassCountsTowardCycle: false,
        makeupCountsTowardCycle: true,
      },
      currentCycle: {
        cycleNumber: 1,
        completedDays: 0,
        extraClassesCount: 0,
        cycleStartDate: new Date(),
        readyToClose: false,
        monthlyFee: 8000,
        amountPaid: 0,
      },
      guardianAccess: {
        linkStatus: 'SHADOW' as any,
        shareTokenHash: 'mock_share_token_hash',
        pinFailedAttempts: 0,
        shareEnabled: true,
        shareRatingWithGuardian: false,
      },
      status: TuitionStatus.ACTIVE,
    });

    expect(tuition._id).toBeDefined();
    expect(tuition.version).toBe(0);
    expect(tuition.students.length).toBe(1);
  });

  it('creates a SessionLog with idempotency key and local calendar date', async () => {
    const log = await SessionLog.create({
      tuitionId: new mongoose.Types.ObjectId(),
      teacherId: new mongoose.Types.ObjectId(),
      cycleNumber: 1,
      sessionDate: new Date(),
      sessionLocalDate: '2026-10-21',
      sessionType: SessionType.REGULAR,
      countsTowardCycle: true,
      clientRequestId: 'req-uuid-12345',
      entries: [
        {
          studentId: new mongoose.Types.ObjectId(),
          attendance: AttendanceStatus.PRESENT,
          subject: 'Physics',
          topicsTaught: 'Thermodynamics Laws',
        },
      ],
    });

    expect(log._id).toBeDefined();
    expect(log.sessionLocalDate).toBe('2026-10-21');
    expect(log.clientRequestId).toBe('req-uuid-12345');
  });

  it('creates EmailOutbox, AuditLog, and Notification records', async () => {
    const outbox = await EmailOutbox.create({
      to: 'guardian@tutorhub.local',
      subject: 'Verify your email',
      html: '<p>Code: 123456</p>',
      status: EmailOutboxStatus.PENDING,
      nextRetryAt: new Date(),
    });
    expect(outbox.status).toBe(EmailOutboxStatus.PENDING);

    const audit = await AuditLog.create({
      action: AuditAction.USER_LOGIN,
      targetType: 'User',
      targetId: 'user-id-123',
      ipAddress: '127.0.0.1',
    });
    expect(audit.action).toBe(AuditAction.USER_LOGIN);

    const notification = await Notification.create({
      userId: new mongoose.Types.ObjectId(),
      type: NotificationType.CYCLE_READY_TO_CLOSE,
      title: 'Cycle Complete',
      body: 'Your 12-day tuition cycle is ready to close.',
    });
    expect(notification.type).toBe(NotificationType.CYCLE_READY_TO_CLOSE);
  });
});
