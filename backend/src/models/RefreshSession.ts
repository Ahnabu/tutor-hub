import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshSession extends Document {
  userId: mongoose.Types.ObjectId;
  familyId: string;
  tokenHash: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedBy?: string; // hash of the replacement token
  createdAt: Date;
  updatedAt: Date;
}

const RefreshSessionSchema = new Schema<IRefreshSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    familyId: {
      type: String,
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userAgent: { type: String },
    ip: { type: String },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index to auto-remove expired sessions
    },
    revokedAt: { type: Date },
    replacedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

RefreshSessionSchema.index({ userId: 1, familyId: 1 });

export const RefreshSession = mongoose.model<IRefreshSession>(
  'RefreshSession',
  RefreshSessionSchema
);
