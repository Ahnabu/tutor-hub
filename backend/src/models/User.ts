import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, AccountStatus, VerificationStatus, ContactVisibilityMode } from '../enums/index.js';

export interface ITeacherProfile {
  isPublic: boolean;
  verificationStatus: VerificationStatus;
  verificationRejectionReason?: string;
  institution?: string;
  department?: string;
  batchOrYear?: string;
  experienceYears?: number;
  bio?: string;
  subjectsOffered: string[];
  preferredAreas: string[];
  expectedRateRange?: string;
  contactVisibilityMode: ContactVisibilityMode;
  slug?: string;
}

export interface IGuardianProfile {
  area?: string;
  city?: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  roles: UserRole[];
  accountStatus: AccountStatus;
  suspensionReason?: string;
  tokenVersion: number;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  avatarUrl?: string;
  avatarPublicId?: string;

  // Sensitive security fields (select: false)
  otpHash?: string;
  otpExpiresAt?: Date;
  otpAttempts?: number;
  otpLastSentAt?: Date;
  claimTokenHash?: string;
  claimTokenExpiresAt?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  failedLoginCount?: number;
  lockedUntil?: Date;

  createdByTeacherId?: mongoose.Types.ObjectId;
  teacherProfile?: ITeacherProfile;
  guardianProfile?: IGuardianProfile;

  createdAt: Date;
  updatedAt: Date;
}

const TeacherProfileSchema = new Schema<ITeacherProfile>(
  {
    isPublic: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.UNSUBMITTED,
    },
    verificationRejectionReason: { type: String },
    institution: { type: String, trim: true },
    department: { type: String, trim: true },
    batchOrYear: { type: String, trim: true },
    experienceYears: { type: Number, min: 0 },
    bio: { type: String, trim: true },
    subjectsOffered: { type: [String], default: [] },
    preferredAreas: { type: [String], default: [] },
    expectedRateRange: { type: String, trim: true },
    contactVisibilityMode: {
      type: String,
      enum: Object.values(ContactVisibilityMode),
      default: ContactVisibilityMode.UPON_REQUEST_APPROVAL,
    },
    slug: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

const GuardianProfileSchema = new Schema<IGuardianProfile>(
  {
    area: { type: String, trim: true },
    city: { type: String, trim: true, default: 'Dhaka' },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.TEACHER],
      required: true,
    },
    accountStatus: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.PENDING_VERIFICATION,
      required: true,
    },
    suspensionReason: { type: String },
    tokenVersion: { type: Number, default: 0, required: true },
    isEmailVerified: { type: Boolean, default: false, required: true },
    lastLoginAt: { type: Date },
    avatarUrl: { type: String },
    avatarPublicId: { type: String },

    // Security fields with select: false
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLastSentAt: { type: Date, select: false },
    claimTokenHash: { type: String, select: false },
    claimTokenExpiresAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    failedLoginCount: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, select: false },

    createdByTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    teacherProfile: { type: TeacherProfileSchema },
    guardianProfile: { type: GuardianProfileSchema },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);
UserSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string' } } }
);
UserSchema.index({ roles: 1, accountStatus: 1 });
UserSchema.index({ 'teacherProfile.verificationStatus': 1 });
UserSchema.index(
  { 'teacherProfile.slug': 1 },
  { unique: true, sparse: true, partialFilterExpression: { 'teacherProfile.slug': { $type: 'string' } } }
);
UserSchema.index({
  name: 'text',
  'teacherProfile.institution': 'text',
  'teacherProfile.department': 'text',
  'teacherProfile.bio': 'text',
  'teacherProfile.subjectsOffered': 'text',
});

export const User = mongoose.model<IUser>('User', UserSchema);
