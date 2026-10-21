import { z } from 'zod';
import {
  SessionType,
  AttendanceStatus,
  HomeworkStatus,
  CancelledBy,
} from '../enums/index.js';

export const sessionEntrySchema = z
  .object({
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ObjectId'),
    attendance: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
    subject: z.string().min(1).max(100),
    topicsTaught: z.string().max(2000).optional(),
    unfinishedTopics: z.string().max(2000).optional(),
    homeworkAssigned: z.string().max(2000).optional(),
    previousHomeworkStatus: z.nativeEnum(HomeworkStatus).optional(),
    nextClassPlan: z.string().max(2000).optional(),
  })
  .strict();

export const createSessionSchema = z
  .object({
    clientRequestId: z.string().min(8).max(128),
    sessionDate: z.string().datetime(),
    sessionLocalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
    startTime: z.string().max(20).optional(),
    durationMinutes: z.number().int().min(15).max(360).default(90),
    sessionType: z.nativeEnum(SessionType).default(SessionType.REGULAR),
    cancelReason: z.string().max(500).optional(),
    cancelledBy: z.nativeEnum(CancelledBy).optional(),
    entries: z.array(sessionEntrySchema).min(1),
    guardianVisibleRemarks: z.string().max(1000).optional(),
    teacherPrivateNotes: z.string().max(1000).optional(),
    studentPerformanceRating: z.number().int().min(1).max(5).optional(),
  })
  .strict();

export const updateSessionSchema = z
  .object({
    entries: z.array(sessionEntrySchema).optional(),
    guardianVisibleRemarks: z.string().max(1000).optional(),
    teacherPrivateNotes: z.string().max(1000).optional(),
    studentPerformanceRating: z.number().int().min(1).max(5).optional(),
    changeSummary: z.string().min(3).max(200),
  })
  .strict();
