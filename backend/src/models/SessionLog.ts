import mongoose, { Schema, Document } from 'mongoose';
import {
  SessionType,
  CancelledBy,
  AttendanceStatus,
  HomeworkStatus,
} from '../enums/index.js';

export interface ISessionEntry {
  studentId: mongoose.Types.ObjectId;
  attendance: AttendanceStatus;
  subject: string;
  topicsTaught?: string;
  unfinishedTopics?: string;
  homeworkAssigned?: string;
  previousHomeworkStatus?: HomeworkStatus;
  nextClassPlan?: string;
}

export interface ISessionAttachment {
  url: string;
  publicId: string;
  label?: string;
}

export interface IEditHistoryItem {
  editedBy: mongoose.Types.ObjectId;
  editedAt: Date;
  changeSummary: string;
}

export interface ISessionLog extends Document {
  tuitionId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  cycleNumber: number;
  sessionNumberInCycle?: number | null;
  sessionDate: Date;
  sessionLocalDate: string; // YYYY-MM-DD
  startTime?: string;
  durationMinutes?: number;
  sessionType: SessionType;
  cancelReason?: string;
  cancelledBy?: CancelledBy;
  countsTowardCycle: boolean;
  clientRequestId: string;
  entries: ISessionEntry[];
  attachments: ISessionAttachment[];
  teacherPrivateNotes?: string;
  guardianVisibleRemarks?: string;
  studentPerformanceRating?: number;
  editedAt?: Date;
  editHistory: IEditHistoryItem[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionEntrySchema = new Schema<ISessionEntry>(
  {
    studentId: { type: Schema.Types.ObjectId, required: true },
    attendance: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT,
      required: true,
    },
    subject: { type: String, required: true, trim: true },
    topicsTaught: { type: String, trim: true },
    unfinishedTopics: { type: String, trim: true },
    homeworkAssigned: { type: String, trim: true },
    previousHomeworkStatus: {
      type: String,
      enum: Object.values(HomeworkStatus),
      default: HomeworkStatus.NONE,
    },
    nextClassPlan: { type: String, trim: true },
  },
  { _id: false }
);

const SessionAttachmentSchema = new Schema<ISessionAttachment>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    label: { type: String, trim: true },
  },
  { _id: false }
);

const EditHistorySchema = new Schema<IEditHistoryItem>(
  {
    editedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    editedAt: { type: Date, default: Date.now },
    changeSummary: { type: String, required: true },
  },
  { _id: false }
);

const SessionLogSchema = new Schema<ISessionLog>(
  {
    tuitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Tuition',
      required: true,
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cycleNumber: { type: Number, required: true },
    sessionNumberInCycle: { type: Number, default: null },
    sessionDate: { type: Date, required: true },
    sessionLocalDate: { type: String, required: true }, // Format: YYYY-MM-DD
    startTime: { type: String },
    durationMinutes: { type: Number, default: 90 },
    sessionType: {
      type: String,
      enum: Object.values(SessionType),
      default: SessionType.REGULAR,
      required: true,
    },
    cancelReason: { type: String, trim: true },
    cancelledBy: { type: String, enum: Object.values(CancelledBy) },
    countsTowardCycle: { type: Boolean, default: true, required: true },
    clientRequestId: { type: String, required: true },
    entries: { type: [SessionEntrySchema], default: [] },
    attachments: { type: [SessionAttachmentSchema], default: [] },
    teacherPrivateNotes: { type: String, select: false },
    guardianVisibleRemarks: { type: String, trim: true },
    studentPerformanceRating: { type: Number, min: 1, max: 5 },
    editedAt: { type: Date },
    editHistory: { type: [EditHistorySchema], default: [] },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes
SessionLogSchema.index({ tuitionId: 1, sessionLocalDate: -1 });
SessionLogSchema.index(
  { teacherId: 1, clientRequestId: 1 },
  { unique: true }
);
SessionLogSchema.index(
  { tuitionId: 1, cycleNumber: 1, sessionNumberInCycle: 1 },
  {
    unique: true,
    partialFilterExpression: {
      countsTowardCycle: true,
      sessionNumberInCycle: { $type: 'number' },
      deletedAt: { $exists: false },
    },
  }
);

export const SessionLog = mongoose.model<ISessionLog>('SessionLog', SessionLogSchema);
