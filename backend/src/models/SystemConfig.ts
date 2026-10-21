import mongoose, { Schema, Document } from 'mongoose';
import { ContactVisibilityMode } from '../enums/index.js';

export interface ISystemConfig extends Document {
  requireAdminApprovalForPosts: boolean;
  forceManualApproval: boolean;
  defaultTeacherContactMode: ContactVisibilityMode;
  maintenanceMode: boolean;
  contactRequestDailyLimit: number;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SystemConfigSchema = new Schema<ISystemConfig>(
  {
    requireAdminApprovalForPosts: { type: Boolean, default: false },
    forceManualApproval: { type: Boolean, default: false },
    defaultTeacherContactMode: {
      type: String,
      enum: Object.values(ContactVisibilityMode),
      default: ContactVisibilityMode.UPON_REQUEST_APPROVAL,
    },
    maintenanceMode: { type: Boolean, default: false },
    contactRequestDailyLimit: { type: Number, default: 10 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export const SystemConfig = mongoose.model<ISystemConfig>(
  'SystemConfig',
  SystemConfigSchema
);
