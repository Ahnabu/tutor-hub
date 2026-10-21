import mongoose, { Schema, Document } from 'mongoose';
import { IPaymentRecord } from './Tuition.js';

export interface ICycleHistory extends Document {
  tuitionId: mongoose.Types.ObjectId;
  cycleNumber: number;
  startDate: Date;
  endDate: Date;
  totalRegularDays: number;
  totalExtraDays: number;
  totalMakeupDays: number;
  totalCancelled: number;
  feeCharged: number;
  amountPaid: number;
  paidAt?: Date;
  paymentsSnapshot: IPaymentRecord[];
  closedBy: mongoose.Types.ObjectId;
  sessionIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CycleHistorySchema = new Schema<ICycleHistory>(
  {
    tuitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Tuition',
      required: true,
      index: true,
    },
    cycleNumber: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalRegularDays: { type: Number, default: 0 },
    totalExtraDays: { type: Number, default: 0 },
    totalMakeupDays: { type: Number, default: 0 },
    totalCancelled: { type: Number, default: 0 },
    feeCharged: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    paidAt: { type: Date },
    paymentsSnapshot: { type: Schema.Types.Mixed, default: [] },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionIds: [{ type: Schema.Types.ObjectId, ref: 'SessionLog' }],
  },
  {
    timestamps: true,
  }
);

CycleHistorySchema.index({ tuitionId: 1, cycleNumber: 1 }, { unique: true });

export const CycleHistory = mongoose.model<ICycleHistory>(
  'CycleHistory',
  CycleHistorySchema
);
