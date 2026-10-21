import mongoose, { Schema, Document } from 'mongoose';
import {
  MarketplaceAuthorRole,
  MarketplaceModerationStatus,
  MarketplacePostStatus,
} from '../enums/index.js';

export interface IStudentInfo {
  classGrade: string;
  curriculum?: string;
  subjects: string[];
}

export interface IPostLocation {
  area: string;
  city: string;
  mode: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
}

export interface IMarketplacePost extends Document {
  authorId: mongoose.Types.ObjectId;
  authorRole: MarketplaceAuthorRole;
  title: string;
  description: string;
  studentsInfo: IStudentInfo[];
  location: IPostLocation;
  daysPerWeek?: number;
  targetDaysPerMonth?: number;
  budgetAmount: number;
  genderPreference?: 'MALE' | 'FEMALE' | 'ANY';
  moderationStatus: MarketplaceModerationStatus;
  moderationNote?: string;
  status: MarketplacePostStatus;
  expiresAt: Date;
  hiredTeacherId?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentInfoSchema = new Schema<IStudentInfo>(
  {
    classGrade: { type: String, required: true },
    curriculum: { type: String },
    subjects: { type: [String], required: true },
  },
  { _id: false }
);

const PostLocationSchema = new Schema<IPostLocation>(
  {
    area: { type: String, required: true },
    city: { type: String, required: true, default: 'Dhaka' },
    mode: {
      type: String,
      enum: ['IN_PERSON', 'ONLINE', 'HYBRID'],
      default: 'IN_PERSON',
      required: true,
    },
  },
  { _id: false }
);

const MarketplacePostSchema = new Schema<IMarketplacePost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorRole: {
      type: String,
      enum: Object.values(MarketplaceAuthorRole),
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    studentsInfo: { type: [StudentInfoSchema], required: true },
    location: { type: PostLocationSchema, required: true },
    daysPerWeek: { type: Number },
    targetDaysPerMonth: { type: Number },
    budgetAmount: { type: Number, required: true, min: 0 },
    genderPreference: {
      type: String,
      enum: ['MALE', 'FEMALE', 'ANY'],
      default: 'ANY',
    },
    moderationStatus: {
      type: String,
      enum: Object.values(MarketplaceModerationStatus),
      default: MarketplaceModerationStatus.PENDING_APPROVAL,
      required: true,
    },
    moderationNote: { type: String },
    status: {
      type: String,
      enum: Object.values(MarketplacePostStatus),
      default: MarketplacePostStatus.OPEN,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      required: true,
    },
    hiredTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

MarketplacePostSchema.index({
  moderationStatus: 1,
  status: 1,
  'location.area': 1,
  createdAt: -1,
});
MarketplacePostSchema.index({ title: 'text', description: 'text' });

export const MarketplacePost = mongoose.model<IMarketplacePost>(
  'MarketplacePost',
  MarketplacePostSchema
);
