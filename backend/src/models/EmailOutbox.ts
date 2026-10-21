import mongoose, { Schema, Document } from 'mongoose';
import { EmailOutboxStatus } from '../enums/index.js';

export interface IEmailOutbox extends Document {
  to: string;
  subject: string;
  html: string;
  text?: string;
  status: EmailOutboxStatus;
  attempts: number;
  lastAttemptAt?: Date;
  nextRetryAt: Date;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailOutboxSchema = new Schema<IEmailOutbox>(
  {
    to: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    html: { type: String, required: true },
    text: { type: String },
    status: {
      type: String,
      enum: Object.values(EmailOutboxStatus),
      default: EmailOutboxStatus.PENDING,
      required: true,
      index: true,
    },
    attempts: { type: Number, default: 0, required: true },
    lastAttemptAt: { type: Date },
    nextRetryAt: { type: Date, default: Date.now, index: true },
    error: { type: String },
    sentAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

EmailOutboxSchema.index({ status: 1, nextRetryAt: 1 });

export const EmailOutbox = mongoose.model<IEmailOutbox>(
  'EmailOutbox',
  EmailOutboxSchema
);
