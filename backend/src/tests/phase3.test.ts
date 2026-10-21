import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import { User } from '../models/User.js';
import { Tuition } from '../models/Tuition.js';
import { ContactAccessRequest } from '../models/ContactAccessRequest.js';
import { ContactGrant } from '../models/ContactGrant.js';
import { AuditLog } from '../models/AuditLog.js';
import { UserRole, AccountStatus, VerificationStatus, ContactVisibilityMode } from '../enums/index.js';
import { signAccessToken } from '../utils/crypto.js';

describe('Phase 3: Guardian Portal, Gated Profiles & Contact Access Workflow', () => {
  let mongod: MongoMemoryServer;
  let teacherId: string;
  let teacherToken: string;
  let guardianId: string;
  let guardianToken: string;
  let tuitionId: string;
  let shareToken = '';
  const pin = '4321';

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // 1. Seed Teacher with Public Profile
    const teacher = await User.create({
      name: 'Tanvir Hossain',
      email: 'tanvir@test.local',
      phone: '+8801711223344',
      roles: [UserRole.TEACHER],
      accountStatus: AccountStatus.ACTIVE,
      isEmailVerified: true,
      tokenVersion: 1,
      teacherProfile: {
        isPublic: true,
        verificationStatus: VerificationStatus.VERIFIED,
        institution: 'Dhaka University',
        department: 'Physics',
        batchOrYear: '2019',
        experienceYears: 4,
        bio: 'Passionate physics tutor specializing in HSC and Admission prep.',
        subjectsOffered: ['Physics', 'Higher Math'],
        preferredAreas: ['Dhanmondi', 'Mirpur'],
        expectedRateRange: '8,000 - 12,000 BDT',
        contactVisibilityMode: ContactVisibilityMode.UPON_REQUEST_APPROVAL,
        slug: 'tanvir-hossain-du',
      },
    });
    teacherId = teacher._id.toString();
    teacherToken = signAccessToken({
      sub: teacherId,
      roles: [UserRole.TEACHER],
      tokenVersion: 1,
    });

    // 2. Seed Guardian
    const guardian = await User.create({
      name: 'Mr. Anisul Haque',
      email: 'anisul@test.local',
      phone: '+8801811223344',
      roles: [UserRole.GUARDIAN],
      accountStatus: AccountStatus.ACTIVE,
      isEmailVerified: true,
      tokenVersion: 1,
    });
    guardianId = guardian._id.toString();
    guardianToken = signAccessToken({
      sub: guardianId,
      roles: [UserRole.GUARDIAN],
      tokenVersion: 1,
    });

    // 3. Create Tuition and generate Share Token with PIN
    const tuitionRes = await request(app)
      .post('/api/v1/tuitions')
      .set('Cookie', [`th_access_token=${teacherToken}`])
      .set('X-Requested-With', 'tutorhub')
      .send({
        title: 'HSC Physics - Ahsan',
        students: [{ name: 'Ahsan', classGrade: 'Class 12', subjects: ['Physics'] }],
        scheduleConfig: {
          billingModel: 'MONTHLY_CYCLE',
          targetDaysPerCycle: 12,
          weeklyDays: ['SUN', 'TUE', 'THU'],
          durationMinutes: 90,
        },
        monthlyFee: 10000,
        guardianName: 'Mr. Anisul Haque',
        guardianPhone: '+8801811223344',
      });

    expect(tuitionRes.status).toBe(201);
    tuitionId = tuitionRes.body.data.tuition._id;

    // Generate Share Token with PIN 4321
    const shareRes = await request(app)
      .post(`/api/v1/tuitions/${tuitionId}/share-token`)
      .set('Cookie', [`th_access_token=${teacherToken}`])
      .set('X-Requested-With', 'tutorhub')
      .send({ accessPin: pin });

    shareToken = shareRes.body.data.shareToken;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  // =========================================================================
  // 1. PUBLIC TEACHER DIRECTORY & GATED PROFILES
  // =========================================================================
  it('GET /teachers returns public active teachers without leaking phone/email', async () => {
    const res = await request(app).get('/api/v1/teachers');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.teachers.length).toBeGreaterThanOrEqual(1);

    const teacher = res.body.data.teachers.find((t: any) => t.id === teacherId);
    expect(teacher).toBeDefined();
    expect(teacher.name).toBe('Tanvir Hossain');
    expect(teacher.institution).toBe('Dhaka University');
    expect(teacher.isVerifiedTutor).toBe(true);
    expect(teacher.slug).toBe('tanvir-hossain-du');

    // Strict privacy asserts: phone and email MUST NOT be exposed in public directory
    expect(teacher.phone).toBeUndefined();
    expect(teacher.email).toBeUndefined();
    expect(teacher.passwordHash).toBeUndefined();
  });

  it('GET /teachers/:slug returns teacher public profile by slug', async () => {
    const res = await request(app).get('/api/v1/teachers/tanvir-hossain-du');

    expect(res.status).toBe(200);
    expect(res.body.data.teacher.name).toBe('Tanvir Hossain');
    expect(res.body.data.teacher.bio).toContain('Passionate physics tutor');
    expect(res.body.data.teacher.phone).toBeUndefined();
  });

  // =========================================================================
  // 2. PIN-PROTECTED GUARDIAN SHARE LINK & OVERVIEW
  // =========================================================================
  it('GET /guardian/view/:token returns requiresPin: true when PIN has not been provided', async () => {
    const res = await request(app).get(`/api/v1/guardian/view/${shareToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.requiresPin).toBe(true);
    expect(res.body.data.tuition).toBeUndefined();
  });

  it('POST /guardian/view/:token/verify-pin rejects incorrect PIN', async () => {
    const res = await request(app)
      .post(`/api/v1/guardian/view/${shareToken}/verify-pin`)
      .set('X-Requested-With', 'tutorhub')
      .send({ pin: '9999' });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toContain('Incorrect PIN');
  });

  let viewToken = '';
  it('POST /guardian/view/:token/verify-pin accepts correct PIN and sets view session', async () => {
    const res = await request(app)
      .post(`/api/v1/guardian/view/${shareToken}/verify-pin`)
      .set('X-Requested-With', 'tutorhub')
      .send({ pin });

    expect(res.status).toBe(200);
    expect(res.body.data.viewToken).toBeDefined();
    viewToken = res.body.data.viewToken;

    // Cookie is set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c: string) => c.includes('guardian_view_token='))).toBe(true);
  });

  it('GET /guardian/view/:token returns sanitized tuition details when view token is present', async () => {
    const res = await request(app)
      .get(`/api/v1/guardian/view/${shareToken}`)
      .set('X-Guardian-View-Token', viewToken);

    expect(res.status).toBe(200);
    expect(res.body.data.requiresPin).toBe(false);
    expect(res.body.data.tuition).toBeDefined();
    expect(res.body.data.tuition.title).toBe('HSC Physics - Ahsan');
    expect(res.body.data.tuition.currentCycle.monthlyFee).toBe(10000);
    expect(res.body.data.tuition.teacher.name).toBe('Tanvir Hossain');

    // Asserts teacher's private phone/email is NOT leaked to guardian portal
    expect(res.body.data.tuition.teacher.phone).toBeUndefined();
    expect(res.body.data.tuition.teacher.email).toBeUndefined();
  });

  // =========================================================================
  // 3. CLAIMED GUARDIAN DASHBOARD
  // =========================================================================
  it('GET /guardian/tuitions returns tuitions linked to the claimed guardian', async () => {
    const res = await request(app)
      .get('/api/v1/guardian/tuitions')
      .set('Cookie', [`th_access_token=${guardianToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.tuitions.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.tuitions[0].title).toBe('HSC Physics - Ahsan');
  });

  // =========================================================================
  // 4. GATED CONTACT ACCESS REQUEST WORKFLOW
  // =========================================================================
  let requestId = '';
  it('POST /contact-requests creates a pending request from guardian to teacher', async () => {
    const res = await request(app)
      .post('/api/v1/contact-requests')
      .set('Cookie', [`th_access_token=${guardianToken}`])
      .set('X-Requested-With', 'tutorhub')
      .send({
        targetTeacherId: teacherId,
        reasonOrNote: 'Interested in HSC physics tutoring for my son.',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.request.status).toBe('PENDING');
    requestId = res.body.data.request._id;
  });

  it('GET /contact-requests/incoming allows teacher to view incoming request', async () => {
    const res = await request(app)
      .get('/api/v1/contact-requests/incoming')
      .set('Cookie', [`th_access_token=${teacherToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.requests.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.requests[0].guardian.name).toBe('Mr. Anisul Haque');
  });

  it('POST /contact-requests/:id/respond allows teacher to APPROVE request and grants contact', async () => {
    const res = await request(app)
      .post(`/api/v1/contact-requests/${requestId}/respond`)
      .set('Cookie', [`th_access_token=${teacherToken}`])
      .set('X-Requested-With', 'tutorhub')
      .send({ action: 'APPROVE' });

    expect(res.status).toBe(200);
    expect(res.body.data.request.status).toBe('APPROVED');

    // Verify ContactGrant was persisted
    const grant = await ContactGrant.findOne({
      guardianId: new mongoose.Types.ObjectId(guardianId),
      teacherId: new mongoose.Types.ObjectId(teacherId),
    });
    expect(grant).toBeDefined();

    // Verify AuditLog was recorded
    const audit = await AuditLog.findOne({
      actorId: new mongoose.Types.ObjectId(teacherId),
      action: 'CONTACT_GRANT_APPROVED',
    });
    expect(audit).toBeDefined();
  });

  it('GET /contact-requests/revealed/:teacherId reveals contact information after grant', async () => {
    const res = await request(app)
      .get(`/api/v1/contact-requests/revealed/${teacherId}`)
      .set('Cookie', [`th_access_token=${guardianToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.contact.name).toBe('Tanvir Hossain');
    expect(res.body.data.contact.phone).toBe('+8801711223344');
    expect(res.body.data.contact.email).toBe('tanvir@test.local');
  });
});
