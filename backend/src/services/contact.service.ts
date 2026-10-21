import mongoose from 'mongoose';
import { ContactAccessRequest, IContactAccessRequest } from '../models/ContactAccessRequest.js';
import { ContactGrant } from '../models/ContactGrant.js';
import { User, IUser } from '../models/User.js';
import { TeacherPrivateProfile } from '../models/TeacherPrivateProfile.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import {
  ContactRequestStatus,
  ContactApprovedBy,
  ContactGrantSource,
  NotificationType,
  AuditAction,
  UserRole,
} from '../enums/index.js';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
} from '../utils/errors.js';

export class ContactService {
  /**
   * Guardian requests contact information of a teacher
   */
  static async requestContact(
    guardianId: string,
    targetTeacherId: string,
    reasonOrNote?: string
  ): Promise<IContactAccessRequest> {
    if (guardianId === targetTeacherId) {
      throw new BadRequestError('You cannot request contact access for your own account');
    }

    const teacher = await User.findById(targetTeacherId);
    if (!teacher || !teacher.roles.includes(UserRole.TEACHER)) {
      throw new NotFoundError('Teacher profile not found');
    }

    // Check if grant already exists
    const existingGrant = await ContactGrant.findOne({
      guardianId: new mongoose.Types.ObjectId(guardianId),
      teacherId: new mongoose.Types.ObjectId(targetTeacherId),
      revokedAt: { $exists: false },
    });
    if (existingGrant) {
      throw new ConflictError('You already have active contact access for this tutor');
    }

    // Check existing pending request
    const existingReq = await ContactAccessRequest.findOne({
      requesterId: new mongoose.Types.ObjectId(guardianId),
      targetTeacherId: new mongoose.Types.ObjectId(targetTeacherId),
      status: ContactRequestStatus.PENDING,
    });
    if (existingReq) {
      return existingReq;
    }

    const guardian = await User.findById(guardianId);

    const request = await ContactAccessRequest.create({
      requesterId: new mongoose.Types.ObjectId(guardianId),
      targetTeacherId: new mongoose.Types.ObjectId(targetTeacherId),
      reasonOrNote,
      status: ContactRequestStatus.PENDING,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Notify teacher
    await Notification.create({
      userId: teacher._id,
      type: NotificationType.CONTACT_REQUEST,
      title: 'New Contact Information Request',
      body: `${guardian?.name || 'A guardian'} requested your direct contact details.`,
      link: '/teacher?tab=contact-requests',
    });

    return request;
  }

  /**
   * Guardian views their sent requests
   */
  static async getGuardianRequests(guardianId: string): Promise<Record<string, unknown>[]> {
    const requests = await ContactAccessRequest.find({
      requesterId: new mongoose.Types.ObjectId(guardianId),
    })
      .sort({ createdAt: -1 })
      .lean();

    const teacherIds = [...new Set(requests.map((r) => r.targetTeacherId.toString()))];
    const teachers = await User.find({ _id: { $in: teacherIds } }).lean();
    const teacherMap = new Map(teachers.map((t) => [t._id.toString(), t]));

    // Check grants
    const grants = await ContactGrant.find({
      guardianId: new mongoose.Types.ObjectId(guardianId),
      teacherId: { $in: teacherIds.map((id) => new mongoose.Types.ObjectId(id)) },
      revokedAt: { $exists: false },
    }).lean();
    const grantedTeacherSet = new Set(grants.map((g) => g.teacherId.toString()));

    return requests.map((r) => {
      const teacher = teacherMap.get(r.targetTeacherId.toString());
      const hasGrant = grantedTeacherSet.has(r.targetTeacherId.toString());

      return {
        id: r._id.toString(),
        status: r.status,
        reasonOrNote: r.reasonOrNote,
        createdAt: r.createdAt.toISOString(),
        teacher: teacher
          ? {
              id: teacher._id.toString(),
              name: teacher.name,
              avatarUrl: teacher.avatarUrl,
              institution: teacher.teacherProfile?.institution,
              slug: teacher.teacherProfile?.slug,
              // Gated contact revealed ONLY if granted
              phone: hasGrant ? teacher.phone : undefined,
              email: hasGrant ? teacher.email : undefined,
            }
          : { name: 'Tutor' },
      };
    });
  }

  /**
   * Teacher views incoming requests
   */
  static async getTeacherIncomingRequests(teacherId: string): Promise<Record<string, unknown>[]> {
    const requests = await ContactAccessRequest.find({
      targetTeacherId: new mongoose.Types.ObjectId(teacherId),
    })
      .sort({ createdAt: -1 })
      .lean();

    const guardianIds = [...new Set(requests.map((r) => r.requesterId.toString()))];
    const guardians = await User.find({ _id: { $in: guardianIds } }).lean();
    const guardianMap = new Map(guardians.map((g) => [g._id.toString(), g]));

    return requests.map((r) => {
      const guardian = guardianMap.get(r.requesterId.toString());
      return {
        id: r._id.toString(),
        status: r.status,
        reasonOrNote: r.reasonOrNote,
        createdAt: r.createdAt.toISOString(),
        guardian: guardian
          ? {
              id: guardian._id.toString(),
              name: guardian.name,
              phone: guardian.phone,
              email: guardian.email,
              avatarUrl: guardian.avatarUrl,
            }
          : { name: 'Guardian' },
      };
    });
  }

  /**
   * Teacher approves or rejects contact request
   */
  static async respondToRequest(
    teacherId: string,
    requestId: string,
    action: 'APPROVE' | 'REJECT'
  ): Promise<IContactAccessRequest> {
    const request = await ContactAccessRequest.findOne({
      _id: new mongoose.Types.ObjectId(requestId),
      targetTeacherId: new mongoose.Types.ObjectId(teacherId),
    });

    if (!request) {
      throw new NotFoundError('Contact request not found');
    }

    if (request.status !== ContactRequestStatus.PENDING) {
      throw new BadRequestError(`Request has already been ${request.status.toLowerCase()}`);
    }

    if (action === 'APPROVE') {
      request.status = ContactRequestStatus.APPROVED;
      request.approvedBy = ContactApprovedBy.TEACHER;
      request.decidedAt = new Date();

      // Upsert grant
      await ContactGrant.findOneAndUpdate(
        {
          guardianId: request.requesterId,
          teacherId: request.targetTeacherId,
        },
        {
          source: ContactGrantSource.DIRECT_REQUEST,
          revokedAt: undefined,
        },
        { upsert: true, new: true }
      );

      // Audit Log
      await AuditLog.create({
        actorId: new mongoose.Types.ObjectId(teacherId),
        action: AuditAction.CONTACT_GRANT_CREATED,
        targetId: request.requesterId,
        details: { requestId: request._id },
      });

      // Notify guardian
      const teacher = await User.findById(teacherId);
      await Notification.create({
        userId: request.requesterId,
        type: NotificationType.CONTACT_APPROVED,
        title: 'Contact Request Approved',
        body: `${teacher?.name || 'Tutor'} approved your contact request. You can now view their direct phone and email.`,
        link: `/teachers/${teacher?.teacherProfile?.slug || teacherId}`,
      });
    } else {
      request.status = ContactRequestStatus.REJECTED;
      request.decidedAt = new Date();
    }

    await request.save();
    return request;
  }

  /**
   * Checks and retrieves revealed contact details if granted
   */
  static async getRevealedContact(
    guardianId: string,
    teacherId: string
  ): Promise<{ name: string; phone?: string; email?: string; whatsapp?: string }> {
    const grant = await ContactGrant.findOne({
      guardianId: new mongoose.Types.ObjectId(guardianId),
      teacherId: new mongoose.Types.ObjectId(teacherId),
      revokedAt: { $exists: false },
    });

    if (!grant) {
      throw new ForbiddenError('You do not have approved contact access for this tutor');
    }

    const [teacher, privateProfile] = await Promise.all([
      User.findById(teacherId),
      TeacherPrivateProfile.findOne({ userId: new mongoose.Types.ObjectId(teacherId) }),
    ]);

    if (!teacher) {
      throw new NotFoundError('Teacher account not found');
    }

    return {
      name: teacher.name,
      phone: teacher.phone,
      email: teacher.email,
      whatsapp: privateProfile?.whatsapp || teacher.phone,
    };
  }
}
