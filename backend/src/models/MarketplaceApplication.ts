import mongoose, { Schema, Document } from 'mongoose';
import { MarketplaceApplicationStatus } from '../enums/index.js';

export interface IMarketplaceApplication extends Document {
  postId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  message?: string;
  status: MarketplaceApplicationStatus;
  appliedAt: Date;
  updatedAt: Date;
}

const MarketplaceApplicationSchema = new Schema<IMarketplaceApplication>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'MarketplacePost',
      required: true,
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(MarketplaceApplicationStatus),
      default: MarketplaceApplicationStatus.PENDING,
      required: true,
    },
    appliedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'appliedAt', updatedAt: true },
  }
);

MarketplaceApplicationSchema.index(
  { postId: 1, teacherId: 1 },
  { unique: true }
);

export const MarketplaceApplication = mongoose.model<IMarketplaceApplication>(
  'MarketplaceApplication',
  MarketplaceApplicationSchema
);
