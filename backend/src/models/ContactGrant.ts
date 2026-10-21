import mongoose, { Schema, Document } from 'mongoose';
import { ContactGrantSource } from '../enums/index.js';

export interface IContactGrant extends Document {
  guardianId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  source: ContactGrantSource;
  postId?: mongoose.Types.ObjectId;
  createdAt: Date;
  revokedAt?: Date;
}

const ContactGrantSchema = new Schema<IContactGrant>(
  {
    guardianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: Object.values(ContactGrantSource),
      required: true,
    },
    postId: { type: Schema.Types.ObjectId, ref: 'MarketplacePost' },
    revokedAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ContactGrantSchema.index({ guardianId: 1, teacherId: 1 }, { unique: true });

export const ContactGrant = mongoose.model<IContactGrant>(
  'ContactGrant',
  ContactGrantSchema
);
