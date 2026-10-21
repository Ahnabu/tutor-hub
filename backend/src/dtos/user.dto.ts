import { IUser, ITeacherProfile, IGuardianProfile } from '../models/User.js';
import { UserRole, AccountStatus, VerificationStatus, ContactVisibilityMode } from '../enums/index.js';

export interface IUserDTO {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roles: UserRole[];
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
  avatarUrl?: string;
  teacherProfile?: ITeacherProfile;
  guardianProfile?: IGuardianProfile;
  createdAt: string;
}

export interface IPublicTeacherDTO {
  id: string;
  name: string;
  avatarUrl?: string;
  institution?: string;
  department?: string;
  batchOrYear?: string;
  experienceYears?: number;
  bio?: string;
  subjectsOffered: string[];
  preferredAreas: string[];
  expectedRateRange?: string;
  isVerifiedTutor: boolean;
  slug?: string;
}

export const toUserDTO = (user: IUser): IUserDTO => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
    accountStatus: user.accountStatus,
    isEmailVerified: user.isEmailVerified,
    avatarUrl: user.avatarUrl,
    teacherProfile: user.teacherProfile,
    guardianProfile: user.guardianProfile,
    createdAt: user.createdAt.toISOString(),
  };
};

export const toPublicTeacherDTO = (user: IUser): IPublicTeacherDTO => {
  const profile = user.teacherProfile;
  return {
    id: user._id.toString(),
    name: user.name,
    avatarUrl: user.avatarUrl,
    institution: profile?.institution,
    department: profile?.department,
    batchOrYear: profile?.batchOrYear,
    experienceYears: profile?.experienceYears,
    bio: profile?.bio,
    subjectsOffered: profile?.subjectsOffered || [],
    preferredAreas: profile?.preferredAreas || [],
    expectedRateRange: profile?.expectedRateRange,
    isVerifiedTutor: profile?.verificationStatus === VerificationStatus.VERIFIED,
    slug: profile?.slug,
  };
};
