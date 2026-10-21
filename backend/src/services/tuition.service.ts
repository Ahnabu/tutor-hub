import crypto from 'crypto';
import mongoose from 'mongoose';
import { Tuition, ITuition } from '../models/Tuition.js';
import { CycleHistory } from '../models/CycleHistory.js';
import { User } from '../models/User.js';
import {
  UserRole,
  AccountStatus,
  TuitionStatus,
  PaymentStatus,
  LinkStatus,
} from '../enums/index.js';
import { sha256, hashPassword } from '../utils/crypto.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';

export interface CreateTuitionInput {
  title?: string;
  students: Array<{
    name: string;
    classGrade: string;
    curriculum?: string;
    subjects: string[];
    isActive?: boolean;
  }>;
  scheduleConfig: {
    billingModel: any;
    targetDaysPerCycle: number;
    weeklyDays: any[];
    preferredTime?: string;
    durationMinutes?: number;
    extraClassCountsTowardCycle?: boolean;
    makeupCountsTowardCycle?: boolean;
  };
  monthlyFee: number;
  cycleStartDate?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  teacherNotes?: string;
}

export interface UpdateTuitionInput {
  title?: string;
  status?: TuitionStatus;
  students?: CreateTuitionInput['students'];
  scheduleConfig?: Partial<CreateTuitionInput['scheduleConfig']>;
  monthlyFee?: number;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  teacherNotes?: string;
}

export interface RecordPaymentInput {
  amount: number;
  method: any;
  paidAt?: string;
  reference?: string;
  note?: string;
  advanceCycle?: boolean;
}

export class TuitionService {
  /**
   * Generates a human-friendly unique tuition code (e.g. TUT-A8F2K9M1)
   */
  private static generateTuitionCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TUT-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Creates a new tuition for a teacher
   */
  static async createTuition(
    teacherId: string,
    input: CreateTuitionInput
  ): Promise<ITuition> {
    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

    // Prepare students with explicit ObjectIds
    const studentsWithIds = input.students.map((s) => ({
      ...s,
      _id: new mongoose.Types.ObjectId(),
      isActive: s.isActive ?? true,
    }));

    // Handle Shadow Guardian Account if contact info is provided
    let guardianUserId: mongoose.Types.ObjectId | undefined;
    if (input.guardianEmail || input.guardianPhone) {
      const query: any[] = [];
      if (input.guardianEmail) query.push({ email: input.guardianEmail.toLowerCase() });
      if (input.guardianPhone) query.push({ phone: input.guardianPhone });

      let existingGuardian = await User.findOne({ $or: query });
      if (!existingGuardian) {
        // Create unclaimed shadow account for guardian
        existingGuardian = await User.create({
          name: input.guardianName || `${input.students[0].name}'s Guardian`,
          email: input.guardianEmail ? input.guardianEmail.toLowerCase() : undefined,
          phone: input.guardianPhone,
          roles: [UserRole.GUARDIAN],
          accountStatus: AccountStatus.UNCLAIMED,
          isEmailVerified: false,
          createdByTeacherId: teacherObjectId,
          tokenVersion: 1,
        });
      }
      guardianUserId = existingGuardian._id;
    }

    const startDate = input.cycleStartDate ? new Date(input.cycleStartDate) : new Date();
    const title =
      input.title ||
      `${input.students.map((s) => s.name).join(', ')} - ${input.students[0].classGrade}`;

    const tuition = await Tuition.create({
      teacherId: teacherObjectId,
      title,
      tuitionCode: this.generateTuitionCode(),
      status: TuitionStatus.ACTIVE,
      students: studentsWithIds,
      scheduleConfig: {
        ...input.scheduleConfig,
        durationMinutes: input.scheduleConfig.durationMinutes ?? 90,
        extraClassCountsTowardCycle: input.scheduleConfig.extraClassCountsTowardCycle ?? true,
        makeupCountsTowardCycle: input.scheduleConfig.makeupCountsTowardCycle ?? true,
      },
      currentCycle: {
        cycleNumber: 1,
        completedDays: 0,
        extraClassesCount: 0,
        cycleStartDate: startDate,
        readyToClose: false,
        monthlyFee: input.monthlyFee,
        paymentStatus: PaymentStatus.PENDING,
        amountPaid: 0,
      },
      guardianAccess: {
        guardianUserId,
        guardianLabel: input.guardianName,
        linkStatus: LinkStatus.SHADOW,
        pinFailedAttempts: 0,
      },
      payments: [],
      teacherNotes: input.teacherNotes,
    });

    return tuition;
  }

  /**
   * Retrieves all tuitions owned by a teacher
   */
  static async getTeacherTuitions(
    teacherId: string,
    status?: TuitionStatus
  ): Promise<ITuition[]> {
    const filter: any = { teacherId: new mongoose.Types.ObjectId(teacherId) };
    if (status) {
      filter.status = status;
    }
    return Tuition.find(filter).sort({ updatedAt: -1 });
  }

  /**
   * Retrieves a single tuition by ID (verifying teacher ownership)
   */
  static async getTuitionById(
    teacherId: string,
    tuitionId: string
  ): Promise<ITuition> {
    const tuition = await Tuition.findById(tuitionId);
    if (!tuition) {
      throw new NotFoundError('Tuition agreement not found');
    }
    if (tuition.teacherId.toString() !== teacherId) {
      throw new ForbiddenError('You do not have access to this tuition agreement');
    }
    return tuition;
  }

  /**
   * Updates an existing tuition
   */
  static async updateTuition(
    teacherId: string,
    tuitionId: string,
    input: UpdateTuitionInput
  ): Promise<ITuition> {
    const tuition = await this.getTuitionById(teacherId, tuitionId);

    if (input.status) tuition.status = input.status;
    if (input.monthlyFee) {
      tuition.currentCycle.monthlyFee = input.monthlyFee;
    }
    if (input.teacherNotes !== undefined) tuition.teacherNotes = input.teacherNotes;

    if (input.students) {
      tuition.students = input.students.map((s) => ({
        ...s,
        _id: new mongoose.Types.ObjectId(),
        isActive: s.isActive ?? true,
      })) as any;
    }

    if (input.scheduleConfig) {
      tuition.scheduleConfig = {
        ...tuition.scheduleConfig,
        ...input.scheduleConfig,
      } as any;
    }

    if (input.guardianName) {
      tuition.guardianAccess.guardianLabel = input.guardianName;
    }

    await tuition.save();
    return tuition;
  }

  /**
   * Generates or regenerates a cryptographically secure share link token and optional PIN
   */
  static async generateGuardianShareToken(
    teacherId: string,
    tuitionId: string,
    pin?: string
  ): Promise<{ shareToken: string; accessPin?: string; linkUrl: string }> {
    const tuition = await this.getTuitionById(teacherId, tuitionId);

    const rawToken = crypto.randomBytes(32).toString('hex');
    tuition.guardianAccess.shareTokenHash = sha256(rawToken);
    tuition.guardianAccess.shareTokenRotatedAt = new Date();
    tuition.guardianAccess.linkStatus = LinkStatus.LINKED;
    tuition.guardianAccess.pinFailedAttempts = 0;
    tuition.guardianAccess.pinLockedUntil = undefined;

    if (pin) {
      tuition.guardianAccess.accessPinHash = await hashPassword(pin);
    } else {
      tuition.guardianAccess.accessPinHash = undefined;
    }

    await tuition.save();

    return {
      shareToken: rawToken,
      accessPin: pin,
      linkUrl: `/guardian?token=${rawToken}`,
    };
  }

  /**
   * Records a payment and optionally advances the billing cycle
   */
  static async recordPayment(
    teacherId: string,
    tuitionId: string,
    input: RecordPaymentInput
  ): Promise<ITuition> {
    const tuition = await this.getTuitionById(teacherId, tuitionId);

    const paidAt = input.paidAt ? new Date(input.paidAt) : new Date();

    // 1. Append payment record to payments
    tuition.payments.push({
      amount: input.amount,
      method: input.method,
      paidAt,
      reference: input.reference,
      note: input.note,
      recordedAt: new Date(),
    });

    // 2. Update current cycle payment totals
    tuition.currentCycle.amountPaid += input.amount;
    if (tuition.currentCycle.amountPaid >= tuition.currentCycle.monthlyFee) {
      tuition.currentCycle.paymentStatus = PaymentStatus.PAID;
    } else if (tuition.currentCycle.amountPaid > 0) {
      tuition.currentCycle.paymentStatus = PaymentStatus.PARTIAL;
    }

    // 3. Advance cycle if requested
    if (input.advanceCycle) {
      // Archive current cycle into CycleHistory
      await CycleHistory.create({
        tuitionId: tuition._id,
        cycleNumber: tuition.currentCycle.cycleNumber,
        startDate: tuition.currentCycle.cycleStartDate,
        endDate: new Date(),
        feeCharged: tuition.currentCycle.monthlyFee,
        amountPaid: tuition.currentCycle.amountPaid,
        paymentsSnapshot: tuition.payments,
        closedBy: tuition.teacherId,
        totalRegularDays: tuition.currentCycle.completedDays,
        totalExtraDays: tuition.currentCycle.extraClassesCount,
      });

      // Reset for next cycle
      tuition.currentCycle = {
        cycleNumber: tuition.currentCycle.cycleNumber + 1,
        completedDays: 0,
        extraClassesCount: 0,
        cycleStartDate: new Date(),
        readyToClose: false,
        monthlyFee: tuition.currentCycle.monthlyFee,
        paymentStatus: PaymentStatus.PENDING,
        amountPaid: 0,
      };
      tuition.payments = [];
    }

    await tuition.save();
    return tuition;
  }

  /**
   * Archives a tuition
   */
  static async archiveTuition(
    teacherId: string,
    tuitionId: string
  ): Promise<ITuition> {
    const tuition = await this.getTuitionById(teacherId, tuitionId);
    tuition.status = TuitionStatus.ARCHIVED;
    await tuition.save();
    return tuition;
  }
}
