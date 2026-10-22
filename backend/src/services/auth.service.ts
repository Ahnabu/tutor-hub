import { User, IUser } from '../models/User.js';
import { RefreshSession } from '../models/RefreshSession.js';
import { Tuition } from '../models/Tuition.js';
import { TeacherPrivateProfile } from '../models/TeacherPrivateProfile.js';
import { SessionLog } from '../models/SessionLog.js';
import { MarketplacePost } from '../models/MarketplacePost.js';
import { MarketplaceApplication } from '../models/MarketplaceApplication.js';
import { UserRole, AccountStatus, LinkStatus, TuitionStatus, MarketplacePostStatus } from '../enums/index.js';

import {
  hashPassword,
  verifyPassword,
  sha256,
  generateNumericOtp,
  generateSecureToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/crypto.js';
import { EmailService } from './email.service.js';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../utils/errors.js';
import { toUserDTO, IUserDTO } from '../dtos/user.dto.js';
import crypto from 'crypto';

export interface IAuthResult {
  user: IUserDTO;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new Teacher or Guardian
   */
  static async register(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: UserRole.TEACHER | UserRole.GUARDIAN;
  }): Promise<{ message: string; email: string }> {
    const normalizedEmail = data.email.toLowerCase().trim();
    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, ...(data.phone ? [{ phone: data.phone }] : [])],
    });

    if (existing) {
      if (existing.accountStatus === AccountStatus.ACTIVE) {
        throw new ConflictError('An account with this email or phone already exists', 'ACCOUNT_EXISTS');
      }
      // If UNCLAIMED (shadow account created by a teacher)
      if (existing.accountStatus === AccountStatus.UNCLAIMED) {
        throw new BadRequestError(
          'An invitation has been sent for this account. Please use your claim link.',
          'USE_CLAIM_LINK'
        );
      }
    }

    const passwordHash = await hashPassword(data.password);
    const otp = generateNumericOtp();
    const otpHash = sha256(otp);
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    let user: IUser;
    if (existing && existing.accountStatus === AccountStatus.PENDING_VERIFICATION) {
      existing.name = data.name;
      existing.email = normalizedEmail;
      existing.passwordHash = passwordHash;
      existing.roles = [data.role];
      existing.otpHash = otpHash;
      existing.otpExpiresAt = otpExpiresAt;
      existing.otpAttempts = 0;
      existing.otpLastSentAt = new Date();
      if (data.phone) existing.phone = data.phone;
      user = await existing.save();
    } else {
      user = await User.create({
        name: data.name,
        email: normalizedEmail,
        phone: data.phone,
        passwordHash,
        roles: [data.role],
        accountStatus: AccountStatus.PENDING_VERIFICATION,
        isEmailVerified: false,
        otpHash,
        otpExpiresAt,
        otpAttempts: 0,
        otpLastSentAt: new Date(),
        teacherProfile:
          data.role === UserRole.TEACHER
            ? {
                isPublic: false,
                subjectsOffered: [],
                preferredAreas: [],
              }
            : undefined,
        guardianProfile:
          data.role === UserRole.GUARDIAN
            ? {
                city: 'Dhaka',
              }
            : undefined,
      });

      if (data.role === UserRole.TEACHER) {
        await TeacherPrivateProfile.create({
          userId: user._id,
          verificationDocs: [],
        });
      }
    }

    await EmailService.sendVerificationOtp(user.email!, user.name, otp);

    return {
      message: 'Registration successful. Please verify your email with the 6-digit code sent.',
      email: user.email!,
    };
  }

  /**
   * Verify email OTP and activate account
   */
  static async verifyEmail(
    email: string,
    otp: string,
    newPassword?: string,
    userAgent?: string,
    ip?: string
  ): Promise<IAuthResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+otpHash +otpExpiresAt +otpAttempts +passwordHash'
    );

    if (!user) {
      throw new NotFoundError('Account not found', 'USER_NOT_FOUND');
    }

    if (user.isEmailVerified && user.accountStatus === AccountStatus.ACTIVE) {
      throw new BadRequestError('Account is already verified. Please log in.', 'ALREADY_VERIFIED');
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      throw new BadRequestError('No verification code was requested', 'NO_OTP_REQUESTED');
    }

    if (user.otpExpiresAt < new Date()) {
      throw new BadRequestError('Verification code has expired. Please request a new one.', 'OTP_EXPIRED');
    }

    if ((user.otpAttempts || 0) >= 5) {
      throw new ForbiddenError(
        'Too many failed attempts. Please request a new verification code.',
        'OTP_ATTEMPTS_EXCEEDED'
      );
    }

    const hashedInput = sha256(otp);
    if (hashedInput !== user.otpHash) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      throw new BadRequestError('Invalid verification code', 'INVALID_OTP');
    }

    // Optionally update password if requested upon verification
    if (newPassword) {
      user.passwordHash = await hashPassword(newPassword);
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    // Activate user
    user.isEmailVerified = true;
    user.accountStatus = AccountStatus.ACTIVE;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    return this.createAuthSession(user, userAgent, ip);
  }

  /**
   * Resend OTP for email verification
   */
  static async resendOtp(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+otpLastSentAt');
    if (!user) {
      // Return generic message to prevent email enumeration
      return { message: 'If an unverified account exists, a new code has been sent.' };
    }

    if (user.isEmailVerified) {
      return { message: 'Account is already verified. Please log in.' };
    }

    if (user.otpLastSentAt) {
      const secondsSinceLast = (Date.now() - user.otpLastSentAt.getTime()) / 1000;
      if (secondsSinceLast < 60) {
        throw new BadRequestError(
          `Please wait ${Math.ceil(60 - secondsSinceLast)} seconds before requesting a new code.`,
          'OTP_COOLDOWN'
        );
      }
    }

    const otp = generateNumericOtp();
    user.otpHash = sha256(otp);
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();
    await user.save();

    await EmailService.sendVerificationOtp(user.email!, user.name, otp);

    return { message: 'A new 6-digit verification code has been sent to your email.' };
  }

  /**
   * User login with email/phone & password
   */
  static async login(
    identifier: string,
    plainPassword: string,
    userAgent?: string,
    ip?: string
  ): Promise<IAuthResult> {
    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier.toLowerCase() } : { phone: identifier };

    const user = await User.findOne(query).select(
      '+passwordHash +failedLoginCount +lockedUntil'
    );

    if (!user) {
      throw new UnauthorizedError('Invalid email/phone or password', 'INVALID_CREDENTIALS');
    }

    // Account lockout protection (5 failed attempts locks for 15 mins)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      throw new ForbiddenError(
        `Account locked due to consecutive failed logins. Try again in ${waitMinutes} minutes.`,
        'ACCOUNT_LOCKED'
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError('Account has no password set. Please use your claim link.', 'NO_PASSWORD');
    }

    const isMatch = await verifyPassword(user.passwordHash, plainPassword);
    if (!isMatch) {
      user.failedLoginCount = (user.failedLoginCount || 0) + 1;
      if (user.failedLoginCount >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
        user.failedLoginCount = 0;
      }
      await user.save();
      throw new UnauthorizedError('Invalid email/phone or password', 'INVALID_CREDENTIALS');
    }

    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new ForbiddenError(user.suspensionReason || 'Account suspended', 'ACCOUNT_SUSPENDED');
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      if (user.accountStatus === AccountStatus.PENDING_VERIFICATION || !user.isEmailVerified) {
        // Automatically issue a fresh OTP code and dispatch it to their email
        const otp = generateNumericOtp();
        user.otpHash = sha256(otp);
        user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        user.otpAttempts = 0;
        user.otpLastSentAt = new Date();
        await user.save();

        if (user.email) {
          await EmailService.sendVerificationOtp(user.email, user.name, otp);
        }

        throw new ForbiddenError(
          'Your account is not verified yet. A fresh verification code has been sent to your email.',
          'ACCOUNT_UNVERIFIED',
          { email: user.email }
        );
      }

      throw new ForbiddenError('Account is not active', 'ACCOUNT_INACTIVE');
    }

    // Reset login failures
    user.failedLoginCount = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    return this.createAuthSession(user, userAgent, ip);
  }

  /**
   * Refresh Token with Family Reuse Theft Detection (Section 3)
   */
  static async refresh(
    refreshTokenRaw: string,
    userAgent?: string,
    ip?: string
  ): Promise<{ accessToken: string; refreshToken: string; user: IUserDTO }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenRaw);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token', 'TOKEN_INVALID');
    }

    const tokenHash = sha256(refreshTokenRaw);
    const session = await RefreshSession.findOne({ tokenHash });

    if (!session) {
      throw new UnauthorizedError('Session not found or expired', 'SESSION_NOT_FOUND');
    }

    // THEFT DETECTION: If a revoked token is presented again, revoke entire family!
    if (session.revokedAt) {
      console.warn(`🚨 SECURITY ALERT: Revoked refresh token reuse detected for family ${session.familyId}!`);
      // Invalidate all sessions in this family
      await RefreshSession.updateMany(
        { familyId: session.familyId },
        { revokedAt: new Date() }
      );
      // Increment user tokenVersion to invalidate any active access tokens
      await User.findByIdAndUpdate(session.userId, { $inc: { tokenVersion: 1 } });
      throw new UnauthorizedError('Security breach detected: Token reuse. Please log in again.', 'TOKEN_REUSED');
    }

    const user = await User.findById(session.userId);
    if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedError('User account not active', 'ACCOUNT_INACTIVE');
    }

    // Invalidate old session
    const newRefreshTokenRaw = signRefreshToken({
      sub: user._id.toString(),
      familyId: session.familyId,
    });
    const newHash = sha256(newRefreshTokenRaw);

    session.revokedAt = new Date();
    session.replacedBy = newHash;
    await session.save();

    // Create new session in the same family
    await RefreshSession.create({
      userId: user._id,
      familyId: session.familyId,
      tokenHash: newHash,
      userAgent: userAgent || session.userAgent,
      ip: ip || session.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const newAccessToken = signAccessToken({
      sub: user._id.toString(),
      roles: user.roles,
      tokenVersion: user.tokenVersion,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenRaw,
      user: toUserDTO(user),
    };
  }

  /**
   * Logout current session
   */
  static async logout(refreshTokenRaw?: string): Promise<void> {
    if (!refreshTokenRaw) return;
    const tokenHash = sha256(refreshTokenRaw);
    await RefreshSession.findOneAndUpdate(
      { tokenHash },
      { revokedAt: new Date() }
    );
  }

  /**
   * Logout all sessions for user (bumps tokenVersion)
   */
  static async logoutAll(userId: string): Promise<void> {
    await RefreshSession.updateMany(
      { userId, revokedAt: { $exists: false } },
      { revokedAt: new Date() }
    );
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
  }

  /**
   * Helper to initialize tokens and RefreshSession record
   */
  private static async createAuthSession(
    user: IUser,
    userAgent?: string,
    ip?: string
  ): Promise<IAuthResult> {
    const familyId = crypto.randomUUID();

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      roles: user.roles,
      tokenVersion: user.tokenVersion,
    });

    const refreshToken = signRefreshToken({
      sub: user._id.toString(),
      familyId,
    });

    await RefreshSession.create({
      userId: user._id,
      familyId,
      tokenHash: sha256(refreshToken),
      userAgent,
      ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: toUserDTO(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Request password reset token
   */
  static async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
      // Constant timing / generic response
      return { message: 'If this email is registered, password reset instructions have been sent.' };
    }

    const resetToken = generateSecureToken(32);
    user.passwordResetTokenHash = sha256(resetToken);
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await EmailService.sendPasswordReset(user.email!, user.name, resetToken);

    return { message: 'If this email is registered, password reset instructions have been sent.' };
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const tokenHash = sha256(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpiresAt');

    if (!user) {
      throw new BadRequestError('Invalid or expired password reset link', 'TOKEN_INVALID');
    }

    user.passwordHash = await hashPassword(newPassword);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate old sessions
    await user.save();

    // Revoke all existing sessions
    await RefreshSession.updateMany({ userId: user._id }, { revokedAt: new Date() });

    return { message: 'Password has been reset successfully. You can now log in.' };
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    if (!user.passwordHash) {
      throw new BadRequestError('Account does not have a local password configured', 'NO_PASSWORD_SET');
    }

    const isValid = await verifyPassword(user.passwordHash, currentPassword);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect', 'INVALID_CREDENTIALS');
    }

    user.passwordHash = await hashPassword(newPassword);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Revoke previous refresh sessions
    await RefreshSession.updateMany(
      { userId: user._id },
      { revokedAt: new Date() }
    );

    return { message: 'Password changed successfully.' };
  }

  /**
   * Initiate guardian shadow account claim flow
   */
  static async claimGuardianStart(claimToken: string): Promise<{ message: string; email: string }> {
    const tokenHash = sha256(claimToken);
    const user = await User.findOne({
      claimTokenHash: tokenHash,
      claimTokenExpiresAt: { $gt: new Date() },
      accountStatus: AccountStatus.UNCLAIMED,
    }).select('+claimTokenHash +claimTokenExpiresAt');

    if (!user || !user.email) {
      throw new BadRequestError('Invalid or expired guardian invitation link', 'CLAIM_LINK_INVALID');
    }

    const otp = generateNumericOtp();
    user.otpHash = sha256(otp);
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();

    await EmailService.sendVerificationOtp(user.email, user.name, otp);

    return {
      message: 'A 6-digit confirmation code was sent to the guardian email address.',
      email: user.email,
    };
  }

  /**
   * Verify guardian claim OTP and set password to activate account
   */
  static async claimGuardianVerify(
    claimToken: string,
    otp: string,
    password: string,
    userAgent?: string,
    ip?: string
  ): Promise<IAuthResult> {
    const tokenHash = sha256(claimToken);
    const user = await User.findOne({
      claimTokenHash: tokenHash,
      claimTokenExpiresAt: { $gt: new Date() },
      accountStatus: AccountStatus.UNCLAIMED,
    }).select('+claimTokenHash +claimTokenExpiresAt +otpHash +otpExpiresAt +otpAttempts');

    if (!user) {
      throw new BadRequestError('Invalid or expired guardian invitation link', 'CLAIM_LINK_INVALID');
    }

    if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestError('Verification code expired. Please restart the claim process.', 'OTP_EXPIRED');
    }

    if (sha256(otp) !== user.otpHash) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      throw new BadRequestError('Invalid verification code', 'INVALID_OTP');
    }

    // Activate guardian account
    user.passwordHash = await hashPassword(password);
    user.accountStatus = AccountStatus.ACTIVE;
    user.isEmailVerified = true;
    user.claimTokenHash = undefined;
    user.claimTokenExpiresAt = undefined;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    // Link all tuitions referencing this guardian shadow account
    await Tuition.updateMany(
      { 'guardianAccess.guardianUserId': user._id },
      { 'guardianAccess.linkStatus': LinkStatus.LINKED }
    );

    return this.createAuthSession(user, userAgent, ip);
  }

  /**
   * Export all user data (GDPR compliance)
   */
  static async exportData(userId: string): Promise<Record<string, unknown>> {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const [tuitions, privateProfile, sessions, marketplacePosts, applications] =
      await Promise.all([
        Tuition.find({
          $or: [
            { teacherId: user._id },
            { guardianId: user._id },
            { 'guardianAccess.guardianUserId': user._id },
          ],
        }).lean(),
        TeacherPrivateProfile.findOne({ userId: user._id }).lean(),
        SessionLog.find({ teacherId: user._id }).lean(),
        MarketplacePost.find({ authorId: user._id }).lean(),
        MarketplaceApplication.find({ teacherId: user._id }).lean(),
      ]);

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        teacherProfile: user.teacherProfile,
        guardianProfile: user.guardianProfile,
        createdAt: user.createdAt,
      },
      privateProfile: privateProfile
        ? {
            whatsapp: privateProfile.whatsapp,
            alternatePhone: privateProfile.alternatePhone,
            fullAddress: privateProfile.fullAddress,
            verificationDocsCount: privateProfile.verificationDocs?.length || 0,
          }
        : null,
      tuitions,
      sessions,
      marketplacePosts,
      applications,
    };
  }

  /**
   * Deactivate/unpublish user account (marks unpublished and deactivates sessions in DB)
   */
  static async deleteAccount(userId: string): Promise<{ message: string }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Mark as unpublished in DB and suspend account
    user.accountStatus = AccountStatus.SUSPENDED;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    if (user.teacherProfile) {
      user.teacherProfile.isPublic = false;
    }
    await user.save();

    // Invalidate all active refresh sessions
    await RefreshSession.updateMany(
      { userId: user._id },
      { revokedAt: new Date() }
    );

    // Archive active tuitions
    await Tuition.updateMany(
      { teacherId: user._id, status: TuitionStatus.ACTIVE },
      { status: TuitionStatus.ARCHIVED, deletedAt: new Date() }
    );

    // Close any open marketplace posts authored by this user
    await MarketplacePost.updateMany(
      { authorId: user._id, status: MarketplacePostStatus.OPEN },
      { status: MarketplacePostStatus.CLOSED }
    );

    return { message: 'Your account has been deactivated and unpublished from public directories.' };
  }
}

