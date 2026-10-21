import mongoose, { Schema, Document } from 'mongoose';
import { ContactRequestStatus, ContactApprovedBy } from '../enums/index.js';

export interface IContactAccessRequest extends Document {
  requesterId: mongoose.Types.ObjectId;
  targetTeacherId: mongoose.Types.ObjectId;
  reasonOrNote?: string;
  status: ContactRequestStatus;
  approvedBy?: ContactApprovedBy;
  decidedAt?: Date;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactAccessRequestSchema = new Schema<IContactAccessRequest>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetTeacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reasonOrNote: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(ContactRequestStatus),
      default: ContactRequestStatus.PENDING,
      required: true,
    },
    approvedBy: {
      type: String,
      enum: Object.values(ContactApprovedBy),
    },
    decidedAt: { type: Date },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      required: true,
    },
    revokedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

ContactAccessRequestSchema.index(
  { requesterId: 1, targetTeacherId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [ContactRequestStatus.PENDING, ContactRequestStatus.APPROVED] },
    },
  }
);

export const ContactAccessRequest = mongoose.model<IContactAccessRequest>(
  'ContactAccessRequest',
  ContactAccessRequestSchema
);
