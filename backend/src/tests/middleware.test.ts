import { describe, it, expect } from 'vitest';
import express, { Request, Response } from 'express';
import request from 'supertest';
import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitize.js';
import { validateRequest } from '../middlewares/validate.js';
import { csrfProtection } from '../middlewares/csrf.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { hashPassword, verifyPassword, sha256, signAccessToken, verifyAccessToken } from '../utils/crypto.js';
import { toUserDTO, toPublicTeacherDTO } from '../dtos/user.dto.js';
import { UserRole, AccountStatus, VerificationStatus, ContactVisibilityMode } from '../enums/index.js';
import mongoose from 'mongoose';

describe('Security Utilities & Middlewares', () => {
  describe('NoSQL Injection Sanitizer', () => {
    it('recursively strips keys starting with $ or containing dots', () => {
      const malicious = {
        name: 'Rahim',
        $gt: { field: 1 },
        'nested.key': 'bad',
        profile: {
          $where: 'sleep(1000)',
          bio: 'Good tutor',
          items: [{ $ne: null }, { valid: 'yes' }],
        },
      };

      const cleaned = sanitizeInput(malicious);
      expect(cleaned).toEqual({
        name: 'Rahim',
        profile: {
          bio: 'Good tutor',
          items: [{}, { valid: 'yes' }],
        },
      });
    });
  });

  describe('Zod Validation Middleware with Strict Mode', () => {
    const testApp = express();
    testApp.use(express.json());

    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
    }).strict();

    testApp.post(
      '/test-validate',
      validateRequest({ body: schema }),
      (req: Request, res: Response) => {
        res.status(200).json({ success: true, data: req.body });
      }
    );
    testApp.use(errorHandler);

    it('accepts valid payload and strips unknown keys in strict mode', async () => {
      const res = await request(testApp)
        .post('/test-validate')
        .send({ email: 'valid@tutorhub.local', name: 'Karim' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects unknown fields with 400 VALIDATION_ERROR', async () => {
      const res = await request(testApp)
        .post('/test-validate')
        .send({ email: 'valid@tutorhub.local', name: 'Karim', hackerField: 'injected' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('CSRF Protection', () => {
    const testApp = express();
    testApp.use(express.json());
    testApp.use(csrfProtection);
    testApp.post('/test-csrf', (_req: Request, res: Response) => {
      res.status(200).json({ success: true });
    });
    testApp.use(errorHandler);

    it('rejects state-changing request without X-Requested-With header', async () => {
      const res = await request(testApp).post('/test-csrf').send({ any: 'data' });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_HEADER_MISSING');
    });

    it('allows request with X-Requested-With: tutorhub', async () => {
      const res = await request(testApp)
        .post('/test-csrf')
        .set('X-Requested-With', 'tutorhub')
        .send({ any: 'data' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Crypto & Argon2 Password Hashing', () => {
    it('hashes password with Argon2id and verifies correctly', async () => {
      const password = 'SuperStrongPassword123!';
      const hash = await hashPassword(password);
      expect(hash).toMatch(/^\$argon2id/);

      const isValid = await verifyPassword(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword(hash, 'WrongPassword');
      expect(isInvalid).toBe(false);
    });

    it('generates reproducible SHA-256 hashes', () => {
      const hash1 = sha256('token123');
      const hash2 = sha256('token123');
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
    });

    it('signs and verifies JWT access tokens', () => {
      const token = signAccessToken({
        sub: 'user-id-123',
        roles: [UserRole.TEACHER],
        tokenVersion: 2,
      });

      const decoded = verifyAccessToken(token);
      expect(decoded.sub).toBe('user-id-123');
      expect(decoded.roles).toContain(UserRole.TEACHER);
      expect(decoded.tokenVersion).toBe(2);
    });
  });

  describe('DTO Leakage Prevention Tests', () => {
    it('toUserDTO never includes passwordHash, otpHash, or claimTokenHash', () => {
      const fakeUser: any = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Teacher Test',
        email: 'teacher@test.local',
        phone: '+8801700000000',
        passwordHash: '$argon2id$v=19$secret_hash',
        otpHash: 'secret_otp_hash',
        claimTokenHash: 'secret_claim_hash',
        roles: [UserRole.TEACHER],
        accountStatus: AccountStatus.ACTIVE,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const dto: any = toUserDTO(fakeUser);
      expect(dto.passwordHash).toBeUndefined();
      expect(dto.otpHash).toBeUndefined();
      expect(dto.claimTokenHash).toBeUndefined();
      expect(dto.id).toBe(fakeUser._id.toString());
      expect(dto.name).toBe('Teacher Test');
    });

    it('toPublicTeacherDTO exposes only public information and computes isVerifiedTutor', () => {
      const fakeUser: any = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Verified Tutor',
        email: 'private@test.local',
        phone: '+8801900000000',
        teacherProfile: {
          institution: 'BUET',
          department: 'CSE',
          verificationStatus: VerificationStatus.VERIFIED,
          subjectsOffered: ['Math', 'Physics'],
          preferredAreas: ['Dhanmondi'],
        },
      };

      const publicDto: any = toPublicTeacherDTO(fakeUser);
      expect(publicDto.email).toBeUndefined();
      expect(publicDto.phone).toBeUndefined();
      expect(publicDto.isVerifiedTutor).toBe(true);
      expect(publicDto.institution).toBe('BUET');
    });
  });
});
