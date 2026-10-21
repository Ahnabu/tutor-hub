import mongoose, { Schema, Document } from 'mongoose';
import {
  BillingModel,
  WeekDay,
  PaymentStatus,
  PaymentMethod,
  LinkStatus,
  TuitionStatus,
} from '../enums/index.js';

export interface IStudentSubdoc {
  _id?: mongoose.Types.ObjectId;
  name: string;
  classGrade: string;
  curriculum?: string;
  subjects: string[];
  isActive: boolean;
}

export interface IScheduleConfig {
  billingModel: BillingModel;
  targetDaysPerCycle: number;
  weeklyDays: WeekDay[];
  preferredTime?: string;
  durationMinutes?: number;
  extraClassCountsTowardCycle: boolean;
  makeupCountsTowardCycle: boolean;
}

export interface ICurrentCycle {
  cycleNumber: number;
  completedDays: number;
  extraClassesCount: number;
  cycleStartDate: Date;
  readyToClose: boolean;
  monthlyFee: number;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  dueDate?: Date;
}

export interface IPaymentRecord {
  _id?: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
  reference?: string;
  note?: string;
  recordedAt: Date;
}

export interface IGuardianAccess {
  guardianUserId?: mongoose.Types.ObjectId;
  guardianLabel?: string;
  linkStatus: LinkStatus;
  shareTokenHash?: string;
  shareTokenRotatedAt?: Date;
  accessPinHash?: string;
  pinFailedAttempts: number;
  pinLockedUntil?: Date;
  shareEnabled: boolean;
  shareRatingWithGuardian: boolean;
}

export interface ITuition extends Document {
  teacherId: mongoose.Types.ObjectId;
  title: string;
  students: IStudentSubdoc[];
  scheduleConfig: IScheduleConfig;
  currentCycle: ICurrentCycle;
  payments: IPaymentRecord[];
  guardianAccess: IGuardianAccess;
  status: TuitionStatus;
  deletedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSubdocSchema = new Schema<IStudentSubdoc>({
  name: { type: String, required: true, trim: true },
  classGrade: { type: String, required: true, trim: true },
  curriculum: { type: String, trim: true },
  subjects: { type: [String], required: true },
  isActive: { type: Boolean, default: true },
});

const ScheduleConfigSchema = new Schema<IScheduleConfig>(
  {
    billingModel: {
      type: String,
      enum: Object.values(BillingModel),
      default: BillingModel.MONTHLY_CYCLE,
      required: true,
    },
    targetDaysPerCycle: { type: Number, default: 12, required: true },
    weeklyDays: {
      type: [String],
      enum: Object.values(WeekDay),
      default: [],
    },
    preferredTime: { type: String },
    durationMinutes: { type: Number, default: 90 },
    extraClassCountsTowardCycle: { type: Boolean, default: false },
    makeupCountsTowardCycle: { type: Boolean, default: true },
  },
  { _id: false }
);

const CurrentCycleSchema = new Schema<ICurrentCycle>(
  {
    cycleNumber: { type: Number, default: 1, required: true },
    completedDays: { type: Number, default: 0, required: true },
    extraClassesCount: { type: Number, default: 0, required: true },
    cycleStartDate: { type: Date, default: Date.now, required: true },
    readyToClose: { type: Boolean, default: false, required: true },
    monthlyFee: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
    },
    amountPaid: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date },
  },
  { _id: false }
);

const PaymentRecordSchema = new Schema<IPaymentRecord>({
  amount: { type: Number, required: true, min: 1 },
  method: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  paidAt: { type: Date, required: true, default: Date.now },
  reference: { type: String, trim: true },
  note: { type: String, trim: true },
  recordedAt: { type: Date, default: Date.now },
});

const GuardianAccessSchema = new Schema<IGuardianAccess>(
  {
    guardianUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    guardianLabel: { type: String, trim: true },
    linkStatus: {
      type: String,
      enum: Object.values(LinkStatus),
      default: LinkStatus.SHADOW,
      required: true,
    },
    shareTokenHash: { type: String },
    shareTokenRotatedAt: { type: Date },
    accessPinHash: { type: String },
    pinFailedAttempts: { type: Number, default: 0 },
    pinLockedUntil: { type: Date },
    shareEnabled: { type: Boolean, default: true },
    shareRatingWithGuardian: { type: Boolean, default: false },
  },
  { _id: false }
);

const TuitionSchema = new Schema<ITuition>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    students: { type: [StudentSubdocSchema], required: true },
    scheduleConfig: { type: ScheduleConfigSchema, required: true },
    currentCycle: { type: CurrentCycleSchema, required: true },
    payments: { type: [PaymentRecordSchema], default: [] },
    guardianAccess: { type: GuardianAccessSchema, required: true },
    status: {
      type: String,
      enum: Object.values(TuitionStatus),
      default: TuitionStatus.ACTIVE,
      required: true,
    },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: 'version',
  }
);

// Indexes
TuitionSchema.index({ teacherId: 1, status: 1 });
TuitionSchema.index(
  { 'guardianAccess.shareTokenHash': 1 },
  { unique: true, sparse: true }
);
TuitionSchema.index({ 'guardianAccess.guardianUserId': 1 });

export const Tuition = mongoose.model<ITuition>('Tuition', TuitionSchema);
