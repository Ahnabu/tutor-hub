import mongoose from 'mongoose';
import { User, IUser } from '../models/User.js';
import { TeacherPrivateProfile } from '../models/TeacherPrivateProfile.js';
import { UserRole, AccountStatus, VerificationStatus, ContactVisibilityMode } from '../enums/index.js';
import { toPublicTeacherDTO, IPublicTeacherDTO, toUserDTO, IUserDTO } from '../dtos/user.dto.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export interface UpdateTeacherProfileInput {
  isPublic?: boolean;
  institution?: string;
  department?: string;
  batchOrYear?: string;
  experienceYears?: number;
  bio?: string;
  subjectsOffered?: string[];
  preferredAreas?: string[];
  expectedRateRange?: string;
  contactVisibilityMode?: ContactVisibilityMode;
}

export interface VerificationDocInput {
  url: string;
  publicId: string;
  docType: string;
}

export class TeacherService {
  /**
   * Updates teacher's public-facing operational profile
   */
  static async updateProfile(
    userId: string,
    input: UpdateTeacherProfileInput
  ): Promise<IUserDTO> {
    const user = await User.findById(userId);
    if (!user || !user.roles.includes(UserRole.TEACHER)) {
      throw new NotFoundError('Teacher account not found');
    }

    if (!user.teacherProfile) {
      user.teacherProfile = {
        isPublic: false,
        verificationStatus: VerificationStatus.UNSUBMITTED,
        subjectsOffered: [],
        preferredAreas: [],
        contactVisibilityMode: ContactVisibilityMode.UPON_REQUEST_APPROVAL,
      };
    }

    // Generate slug if not present
    if (!user.teacherProfile.slug) {
      const baseSlug = user.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      user.teacherProfile.slug = `${baseSlug}-${user._id.toString().substring(18)}`;
    }

    Object.assign(user.teacherProfile, input);
    await user.save();

    return toUserDTO(user);
  }

  /**
   * Submits teacher verification credentials (NID, Student ID, Certificates)
   */
  static async submitVerificationDocs(
    userId: string,
    docs: VerificationDocInput[]
  ): Promise<{ verificationStatus: VerificationStatus }> {
    const user = await User.findById(userId);
    if (!user || !user.roles.includes(UserRole.TEACHER)) {
      throw new NotFoundError('Teacher account not found');
    }

    // Save docs to TeacherPrivateProfile
    await TeacherPrivateProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $push: {
          verificationDocs: {
            $each: docs.map((d) => ({
              url: d.url,
              publicId: d.publicId,
              docType: d.docType,
              uploadedAt: new Date(),
            })),
          },
        },
      },
      { upsert: true, new: true }
    );

    // Update user profile status
    if (!user.teacherProfile) {
      user.teacherProfile = {
        isPublic: false,
        verificationStatus: VerificationStatus.PENDING,
        subjectsOffered: [],
        preferredAreas: [],
        contactVisibilityMode: ContactVisibilityMode.UPON_REQUEST_APPROVAL,
      };
    } else {
      user.teacherProfile.verificationStatus = VerificationStatus.PENDING;
    }

    await user.save();
    return { verificationStatus: VerificationStatus.PENDING };
  }

  /**
   * Browse public verified & active teacher marketplace
   */
  static async getPublicDirectory(filters: {
    search?: string;
    subject?: string;
    area?: string;
    page?: number;
    limit?: number;
  }): Promise<{ teachers: IPublicTeacherDTO[]; total: number }> {
    const query: Record<string, unknown> = {
      roles: UserRole.TEACHER,
      accountStatus: AccountStatus.ACTIVE,
      'teacherProfile.isPublic': true,
    };

    if (filters.subject) {
      query['teacherProfile.subjectsOffered'] = {
        $regex: new RegExp(filters.subject, 'i'),
      };
    }

    if (filters.area) {
      query['teacherProfile.preferredAreas'] = {
        $regex: new RegExp(filters.area, 'i'),
      };
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { name: searchRegex },
        { 'teacherProfile.institution': searchRegex },
        { 'teacherProfile.department': searchRegex },
        { 'teacherProfile.subjectsOffered': searchRegex },
      ];
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      User.find(query)
        .sort({ 'teacherProfile.verificationStatus': 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      teachers: teachers.map((t) => toPublicTeacherDTO(t as unknown as IUser)),
      total,
    };
  }

  /**
   * Get single public profile by slug or ObjectId
   */
  static async getPublicTeacher(identifier: string): Promise<IPublicTeacherDTO> {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const query = isObjectId
      ? { _id: identifier, roles: UserRole.TEACHER, 'teacherProfile.isPublic': true }
      : {
          'teacherProfile.slug': identifier.toLowerCase(),
          roles: UserRole.TEACHER,
          'teacherProfile.isPublic': true,
        };

    const user = await User.findOne(query).lean();
    if (!user) {
      throw new NotFoundError('Teacher profile not found or is currently private');
    }

    return toPublicTeacherDTO(user as unknown as IUser);
  }
}
