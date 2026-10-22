import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import { User } from '../models/User.js';
import { TeacherPrivateProfile } from '../models/TeacherPrivateProfile.js';
import { MarketplacePost } from '../models/MarketplacePost.js';
import { MarketplaceApplication } from '../models/MarketplaceApplication.js';
import { ContactGrant } from '../models/ContactGrant.js';
import { SystemConfig } from '../models/SystemConfig.js';
import { UserRole, AccountStatus, VerificationStatus } from '../enums/index.js';
import { signAccessToken } from '../utils/crypto.js';

describe('Phase 4: Marketplace, Admin Command Center & Compliance Matrix', () => {
  let mongod: MongoMemoryServer;
  let teacherId: string;
  let teacherToken: string;
  let guardianId: string;
  let guardianToken: string;
  let adminId: string;
  let adminToken: string;
  let createdPostId = '';
  let applicationId = '';

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // 1. Seed Teacher
    const teacher = await User.create({
      name: 'Rahim Chowdhury',
      email: 'rahim@test.local',
      phone: '+8801722334455',
      roles: [UserRole.TEACHER],
      accountStatus: AccountStatus.ACTIVE,
      isEmailVerified: true,
      tokenVersion: 1,
      teacherProfile: {
        isPublic: true,
        verificationStatus: VerificationStatus.PENDING,
        institution: 'BUET',
        department: 'CSE',
        experienceYears: 3,
        subjectsOffered: ['Mathematics', 'ICT'],
        preferredAreas: ['Dhanmondi'],
      },
    });
    teacherId = teacher._id.toString();
    teacherToken = signAccessToken({
      sub: teacherId,
      roles: [UserRole.TEACHER],
      tokenVersion: 1,
    });

    // Seed Teacher Private Profile with verification document
    await TeacherPrivateProfile.create({
      userId: teacher._id,
      whatsapp: '+8801722334455',
      verificationDocs: [
        {
          url: 'https://storage.local/buet_id.pdf',
          publicId: 'doc_12345',
          docType: 'STUDENT_ID',
        },
      ],
    });

    // 2. Seed Guardian
    const guardian = await User.create({
      name: 'Mrs. Salma Begum',
      email: 'salma@test.local',
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

    // 3. Seed Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@tutorhub.local',
      phone: '+8801999887766',
      roles: [UserRole.ADMIN],
      accountStatus: AccountStatus.ACTIVE,
      isEmailVerified: true,
      tokenVersion: 1,
    });
    adminId = admin._id.toString();
    adminToken = signAccessToken({
      sub: adminId,
      roles: [UserRole.ADMIN],
      tokenVersion: 1,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('1. Guardian Tuition Requirement Posting', () => {
    it('creates a tuition requirement post on the marketplace', async () => {
      const res = await request(app)
        .post('/api/v1/marketplace/posts')
        .set('Authorization', `Bearer ${guardianToken}`)
        .set('X-Requested-With', 'tutorhub')
        .send({
          title: 'Class 9 Math & Science Tutor Needed in Dhanmondi',
          description: 'Looking for an experienced English version tutor for my son. 3 days a week.',
          classGrade: 'Class 9',
          curriculum: 'English Version',
          subjects: ['Mathematics', 'General Science'],
          area: 'Dhanmondi',
          city: 'Dhaka',
          mode: 'IN_PERSON',
          daysPerWeek: 3,
          budgetAmount: 10000,
          genderPreference: 'ANY',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.post.title).toContain('Dhanmondi');
      expect(res.body.data.post.budgetAmount).toBe(10000);
      createdPostId = res.body.data.post._id.toString();
    });

    it('retrieves public marketplace posts with subject & area filters', async () => {
      const res = await request(app)
        .get('/api/v1/marketplace/posts?area=Dhanmondi&subject=Mathematics')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.posts.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.posts[0].location.area).toBe('Dhanmondi');
      expect(res.body.data.posts[0].author.name).toBe('Mrs. Salma Begum');
    });

    it('allows guardian to view their own posts', async () => {
      const res = await request(app)
        .get('/api/v1/marketplace/my-posts')
        .set('Authorization', `Bearer ${guardianToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.posts.length).toBe(1);
      expect(res.body.data.posts[0].id).toBe(createdPostId);
    });
  });

  describe('2. Teacher Application Workflow', () => {
    it('allows a verified teacher to apply to a tuition post', async () => {
      const res = await request(app)
        .post(`/api/v1/marketplace/posts/${createdPostId}/apply`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .set('X-Requested-With', 'tutorhub')
        .send({
          message: 'Hello, I am a CSE student at BUET with 3 years of experience teaching Class 9 English version.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application.status).toBe('PENDING');
      applicationId = res.body.data.application._id.toString();
    });

    it('rejects duplicate application by same teacher for same post', async () => {
      const res = await request(app)
        .post(`/api/v1/marketplace/posts/${createdPostId}/apply`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .set('X-Requested-With', 'tutorhub')
        .send({
          message: 'Applying again with updated message.',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('already applied');
    });

    it('allows guardian to view applicants for their post', async () => {
      const res = await request(app)
        .get(`/api/v1/marketplace/posts/${createdPostId}/applications`)
        .set('Authorization', `Bearer ${guardianToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.applications.length).toBe(1);
      expect(res.body.data.applications[0].teacher.name).toBe('Rahim Chowdhury');
      expect(res.body.data.applications[0].teacher.institution).toBe('BUET');
    });

    it('allows guardian to accept application and generate mutual ContactGrant', async () => {
      const res = await request(app)
        .post(`/api/v1/marketplace/applications/${applicationId}/respond`)
        .set('Authorization', `Bearer ${guardianToken}`)
        .set('X-Requested-With', 'tutorhub')
        .send({ action: 'ACCEPT' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACCEPTED');
      expect(res.body.data.postStatus).toBe('HIRED');

      // Verify mutual ContactGrant was created
      const grant = await ContactGrant.findOne({
        teacherId,
        guardianId,
      });
      expect(grant).not.toBeNull();
      expect(grant?.revokedAt).toBeUndefined();
    });

  });

  describe('3. Admin Command Center', () => {
    it('forbids non-admin users from accessing /api/v1/admin/stats', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);

      expect(res.body.error.message).toContain('permission');
    });

    it('allows admin to view platform KPI statistics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.totalUsers).toBeGreaterThanOrEqual(3);
      expect(res.body.data.stats.totalTeachers).toBeGreaterThanOrEqual(1);
      expect(res.body.data.stats.pendingVerifications).toBeGreaterThanOrEqual(1);
    });

    it('lists pending teacher verification submissions with docs', async () => {
      const res = await request(app)
        .get('/api/v1/admin/verifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.verifications.length).toBeGreaterThanOrEqual(1);
      const pendingTeacher = res.body.data.verifications.find(
        (v: any) => v.id === teacherId
      );
      expect(pendingTeacher).toBeDefined();
      expect(pendingTeacher.verificationDocs.length).toBe(1);
    });

    it('allows admin to approve teacher verification', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/verifications/${teacherId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Requested-With', 'tutorhub')
        .send({ action: 'APPROVE' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(VerificationStatus.VERIFIED);

      const updated = await User.findById(teacherId);
      expect(updated?.teacherProfile?.verificationStatus).toBe(VerificationStatus.VERIFIED);
    });

    it('allows admin to fetch and update system config', async () => {
      const resGet = await request(app)
        .get('/api/v1/admin/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(resGet.body.success).toBe(true);

      const resPatch = await request(app)
        .patch('/api/v1/admin/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Requested-With', 'tutorhub')
        .send({
          maintenanceMode: false,
          contactRequestDailyLimit: 25,
        })
        .expect(200);

      expect(resPatch.body.success).toBe(true);
      expect(resPatch.body.data.config.contactRequestDailyLimit).toBe(25);
    });
  });

  describe('4. GDPR Compliance & Data Privacy', () => {
    it('allows user to export all personal data as JSON', async () => {
      const res = await request(app)
        .get('/api/v1/auth/export-data')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Rahim Chowdhury');
      expect(res.body.data.privateProfile).not.toBeNull();
      expect(res.body.data.applications.length).toBe(1);
    });

    it('allows user to self-delete / deactivate their account', async () => {
      const res = await request(app)
        .post('/api/v1/auth/delete-account')
        .set('Authorization', `Bearer ${teacherToken}`)
        .set('X-Requested-With', 'tutorhub')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deactivated and unpublished');

      const deactivated = await User.findById(teacherId);
      expect(deactivated?.teacherProfile?.isPublic).toBe(false);
      expect(deactivated?.accountStatus).toBe(AccountStatus.SUSPENDED);
    });
  });
});
