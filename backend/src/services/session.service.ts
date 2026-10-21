import mongoose from 'mongoose';
import { SessionLog, ISessionLog } from '../models/SessionLog.js';
import { Tuition } from '../models/Tuition.js';
import { SessionType, AttendanceStatus, HomeworkStatus } from '../enums/index.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';

export interface CreateSessionInput {
  clientRequestId: string;
  sessionDate: string;
  sessionLocalDate: string;
  startTime?: string;
  durationMinutes?: number;
  sessionType: SessionType;
  cancelReason?: string;
  cancelledBy?: any;
  entries: Array<{
    studentId: string;
    attendance: AttendanceStatus;
    subject: string;
    topicsTaught?: string;
    unfinishedTopics?: string;
    homeworkAssigned?: string;
    previousHomeworkStatus?: HomeworkStatus;
    nextClassPlan?: string;
  }>;
  guardianVisibleRemarks?: string;
  teacherPrivateNotes?: string;
  studentPerformanceRating?: number;
}

export interface UpdateSessionInput {
  entries?: CreateSessionInput['entries'];
  guardianVisibleRemarks?: string;
  teacherPrivateNotes?: string;
  studentPerformanceRating?: number;
  changeSummary: string;
}

export class SessionService {
  /**
   * Retrieves Next-Day Memory Prefill data from the previous session
   */
  static async getNextDayMemoryPrefill(
    teacherId: string,
    tuitionId: string
  ): Promise<{
    lastSessionDate?: string;
    lastSessionNumber?: number;
    entries: Array<{
      studentId: string;
      studentName: string;
      subject: string;
      unfinishedTopics?: string;
      homeworkAssigned?: string;
      nextClassPlan?: string;
    }>;
  }> {
    const tuition = await Tuition.findById(tuitionId);
    if (!tuition) {
      throw new NotFoundError('Tuition agreement not found');
    }
    if (tuition.teacherId.toString() !== teacherId) {
      throw new ForbiddenError('You do not have access to this tuition');
    }

    // Find the latest non-cancelled session for this tuition
    const latestSession = await SessionLog.findOne({
      tuitionId: tuition._id,
      sessionType: { $ne: SessionType.CANCELLED },
    }).sort({ sessionDate: -1 });

    const studentMap = new Map<string, string>();
    tuition.students.forEach((s) => {
      studentMap.set(s._id!.toString(), s.name);
    });

    if (!latestSession) {
      // First session ever: return student skeletons
      return {
        entries: tuition.students.map((s) => ({
          studentId: s._id!.toString(),
          studentName: s.name,
          subject: s.subjects[0] || 'General',
        })),
      };
    }

    const prefilledEntries = latestSession.entries.map((entry) => {
      const studentIdStr = entry.studentId.toString();
      return {
        studentId: studentIdStr,
        studentName: studentMap.get(studentIdStr) || 'Student',
        subject: entry.subject,
        unfinishedTopics: entry.unfinishedTopics,
        homeworkAssigned: entry.homeworkAssigned,
        nextClassPlan: entry.nextClassPlan,
      };
    });

    return {
      lastSessionDate: latestSession.sessionLocalDate,
      lastSessionNumber: latestSession.sessionNumberInCycle ?? undefined,
      entries: prefilledEntries,
    };
  }

  /**
   * Logs a new session with idempotency protection and advances tuition cycle day counts
   */
  static async logSession(
    teacherId: string,
    tuitionId: string,
    input: CreateSessionInput
  ): Promise<ISessionLog> {
    const tuition = await Tuition.findById(tuitionId);
    if (!tuition) {
      throw new NotFoundError('Tuition agreement not found');
    }
    if (tuition.teacherId.toString() !== teacherId) {
      throw new ForbiddenError('You do not have access to this tuition');
    }

    // Idempotency check via clientRequestId
    const existing = await SessionLog.findOne({
      tuitionId: tuition._id,
      clientRequestId: input.clientRequestId,
    });
    if (existing) {
      return existing;
    }

    // Determine cycle counting logic
    let countsTowardCycle = false;
    if (input.sessionType === SessionType.REGULAR) {
      countsTowardCycle = true;
    } else if (input.sessionType === SessionType.MAKEUP_CLASS) {
      countsTowardCycle = tuition.scheduleConfig.makeupCountsTowardCycle;
    } else if (input.sessionType === SessionType.EXTRA_CLASS) {
      countsTowardCycle = tuition.scheduleConfig.extraClassCountsTowardCycle;
    }

    const sessionNumberInCycle = countsTowardCycle
      ? tuition.currentCycle.completedDays + 1
      : null;

    const sessionLog = await SessionLog.create({
      tuitionId: tuition._id,
      teacherId: tuition.teacherId,
      cycleNumber: tuition.currentCycle.cycleNumber,
      sessionNumberInCycle,
      sessionDate: new Date(input.sessionDate),
      sessionLocalDate: input.sessionLocalDate,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes || 90,
      sessionType: input.sessionType,
      cancelReason: input.cancelReason,
      cancelledBy: input.cancelledBy,
      countsTowardCycle,
      clientRequestId: input.clientRequestId,
      entries: input.entries.map((e) => ({
        studentId: new mongoose.Types.ObjectId(e.studentId),
        attendance: e.attendance,
        subject: e.subject,
        topicsTaught: e.topicsTaught,
        unfinishedTopics: e.unfinishedTopics,
        homeworkAssigned: e.homeworkAssigned,
        previousHomeworkStatus: e.previousHomeworkStatus,
        nextClassPlan: e.nextClassPlan,
      })),
      guardianVisibleRemarks: input.guardianVisibleRemarks,
      teacherPrivateNotes: input.teacherPrivateNotes,
      studentPerformanceRating: input.studentPerformanceRating,
      editHistory: [],
    });

    // Advance tuition cycle completed days
    if (countsTowardCycle) {
      tuition.currentCycle.completedDays += 1;
      if (input.sessionType === SessionType.EXTRA_CLASS) {
        tuition.currentCycle.extraClassesCount += 1;
      }
      if (
        tuition.currentCycle.completedDays >=
        tuition.scheduleConfig.targetDaysPerCycle
      ) {
        tuition.currentCycle.readyToClose = true;
      }
      await tuition.save();
    }

    return sessionLog;
  }

  /**
   * Lists session logs for a tuition with pagination
   */
  static async getTuitionSessions(
    teacherId: string,
    tuitionId: string,
    page = 1,
    limit = 20
  ): Promise<{ sessions: ISessionLog[]; total: number; page: number; totalPages: number }> {
    const tuition = await Tuition.findById(tuitionId);
    if (!tuition) {
      throw new NotFoundError('Tuition agreement not found');
    }
    if (tuition.teacherId.toString() !== teacherId) {
      throw new ForbiddenError('You do not have access to this tuition');
    }

    const skip = (page - 1) * limit;
    const filter = { tuitionId: tuition._id };

    const [sessions, total] = await Promise.all([
      SessionLog.find(filter).sort({ sessionDate: -1 }).skip(skip).limit(limit),
      SessionLog.countDocuments(filter),
    ]);

    return {
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Updates an existing session log with edit audit tracking
   */
  static async updateSession(
    teacherId: string,
    tuitionId: string,
    sessionId: string,
    input: UpdateSessionInput
  ): Promise<ISessionLog> {
    const session = await SessionLog.findById(sessionId);
    if (!session || session.tuitionId.toString() !== tuitionId) {
      throw new NotFoundError('Session log not found');
    }
    if (session.teacherId.toString() !== teacherId) {
      throw new ForbiddenError('You do not have access to edit this session');
    }

    // Append to edit history
    session.editHistory.push({
      editedBy: new mongoose.Types.ObjectId(teacherId),
      editedAt: new Date(),
      changeSummary: input.changeSummary,
    });
    session.editedAt = new Date();

    if (input.guardianVisibleRemarks !== undefined) {
      session.guardianVisibleRemarks = input.guardianVisibleRemarks;
    }
    if (input.teacherPrivateNotes !== undefined) {
      session.teacherPrivateNotes = input.teacherPrivateNotes;
    }
    if (input.studentPerformanceRating !== undefined) {
      session.studentPerformanceRating = input.studentPerformanceRating;
    }
    if (input.entries) {
      session.entries = input.entries.map((e) => ({
        studentId: new mongoose.Types.ObjectId(e.studentId),
        attendance: e.attendance,
        subject: e.subject,
        topicsTaught: e.topicsTaught,
        unfinishedTopics: e.unfinishedTopics,
        homeworkAssigned: e.homeworkAssigned,
        previousHomeworkStatus: e.previousHomeworkStatus,
        nextClassPlan: e.nextClassPlan,
      })) as any;
    }

    await session.save();
    return session;
  }
}
