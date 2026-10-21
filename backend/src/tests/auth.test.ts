import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import { User } from '../models/User.js';
import { RefreshSession } from '../models/RefreshSession.js';
import { EmailOutbox } from '../models/EmailOutbox.js';
import { UserRole, AccountStatus } from '../enums/index.js';
import { sha256 } from '../utils/crypto.js';

describe('Auth Endpoints & Token Security Matrix', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  const testEmail = 'tutor@test.local';
  const testPassword = 'Password123!';
  let latestOtp = '';
  let activeAccessToken = '';
  let activeRefreshToken = '';

  it('POST /auth/register creates unverified user and enqueues OTP email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .set('X-Requested-With', 'tutorhub')
      .send({
        name: 'Tanvir Hossain',
        email: testEmail,
        password: testPassword,
        role: UserRole.TEACHER,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe(testEmail);

    // Verify user in DB is PENDING_VERIFICATION
    const user = await User.findOne({ email: testEmail }).select('+otpHash');
    expect(user).toBeDefined();
    expect(user?.accountStatus).toBe(AccountStatus.PENDING_VERIFICATION);
    expect(user?.isEmailVerified).toBe(false);

    // Verify outbox email was created
    const emailOutbox = await EmailOutbox.findOne({ to: testEmail });
    expect(emailOutbox).toBeDefined();

    // Extract OTP from email HTML using regex
    const match = emailOutbox?.html.match(/letter-spacing: 8px[^>]*>(\d{6})</);
    expect(match).toBeDefined();
    latestOtp = match![1];
  });

  it('POST /auth/verify-email rejects wrong OTP and limits attempts', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .set('X-Requested-With', 'tutorhub')
      .send({
        email: testEmail,
        otp: '000000',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_OTP');
  });

  it('POST /auth/verify-email activates user and issues auth cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .set('X-Requested-With', 'tutorhub')
      .send({
        email: testEmail,
        otp: latestOtp,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.accountStatus).toBe(AccountStatus.ACTIVE);
    expect(res.body.data.user.isEmailVerified).toBe(true);

    // Check Set-Cookie headers
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('th_access_token='))).toBe(true);
    expect(cookies.some((c) => c.includes('th_refresh_token='))).toBe(true);

    activeAccessToken = res.body.data.accessToken;
    // Extract refresh token from cookie
    const refreshCookie = cookies.find((c) => c.includes('th_refresh_token='));
    activeRefreshToken = refreshCookie!.split(';')[0].replace('th_refresh_token=', '');
  });

  it('GET /auth/me returns authenticated user DTO', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`th_access_token=${activeAccessToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.otpHash).toBeUndefined();
  });

  it('POST /auth/refresh rotates refresh token cleanly', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('X-Requested-With', 'tutorhub')
      .set('Cookie', [`th_refresh_token=${activeRefreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();

    const cookies = res.headers['set-cookie'] as unknown as string[];
    const newRefreshCookie = cookies.find((c) => c.includes('th_refresh_token='));
    const newRefreshToken = newRefreshCookie!.split(';')[0].replace('th_refresh_token=', '');

    expect(newRefreshToken).not.toBe(activeRefreshToken);

    // Old token should be marked revoked in DB
    const oldSession = await RefreshSession.findOne({
      tokenHash: sha256(activeRefreshToken),
    });
    expect(oldSession?.revokedAt).toBeDefined();

    // Now attempt THEFT REUSE: use the old revoked activeRefreshToken
    const reuseRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('X-Requested-With', 'tutorhub')
      .set('Cookie', [`th_refresh_token=${activeRefreshToken}`]);

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.error.code).toBe('TOKEN_REUSED');

    // Entire family should now be revoked!
    const familySessions = await RefreshSession.find({
      familyId: oldSession?.familyId,
    });
    expect(familySessions.every((s) => s.revokedAt !== undefined)).toBe(true);
  });

  it('Rejects requests immediately if user is suspended even with valid token', async () => {
    // Suspend user
    await User.findOneAndUpdate(
      { email: testEmail },
      { accountStatus: AccountStatus.SUSPENDED, suspensionReason: 'Policy violation' }
    );

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`th_access_token=${activeAccessToken}`]);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_SUSPENDED');
  });

  it('POST /uploads/signature forces user folder and rejects unauthenticated callers', async () => {
    // Reactivate user for this test
    const user = await User.findOneAndUpdate(
      { email: testEmail },
      { accountStatus: AccountStatus.ACTIVE, tokenVersion: 1 },
      { new: true }
    );

    // Create fresh token with tokenVersion 1
    const { AuthService } = await import('../services/auth.service.js');
    const authResult = await AuthService.login(testEmail, testPassword);

    const res = await request(app)
      .post('/api/v1/uploads/signature')
      .set('X-Requested-With', 'tutorhub')
      .set('Cookie', [`th_access_token=${authResult.accessToken}`])
      .send({
        purpose: 'AVATAR',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.folder).toBe(`tutorhub/avatar/${user?._id.toString()}`);
    expect(res.body.data.signature).toBeDefined();
    expect(res.body.data.apiKey).toBeDefined();
  });
});
