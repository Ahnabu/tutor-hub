import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import { User } from '../models/User.js';
import { Tuition } from '../models/Tuition.js';
import { CycleHistory } from '../models/CycleHistory.js';
import { UserRole, AccountStatus, WeekDay, BillingModel, AttendanceStatus, PaymentMethod, PaymentStatus } from '../enums/index.js';
import { signAccessToken } from '../utils/crypto.js';

describe('Tuition Engine & Next-Day Memory Prefill Test Suite', () => {
  let mongod: MongoMemoryServer;
  let teacherId: string;
  let teacherToken: string;
  let otherTeacherToken: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // Seed teacher
    const teacher = await User.create({
      name: 'Rahim Sir',
      email: 'rahim@test.local',
      roles: [UserRole.TEACHER],
      accountStatus: AccountStatus.ACTIVE,
      isEmailVerified: true,
      tokenVersion: 1,
    });
    teacherId = teacher._id.toString();
    teacherToken = signAccessToken({
      sub: teacherId,
      roles: [UserRole.TEACHER],
      tokenVersion: 1,
    });

    // Seed second teacher for authorization boundary tests
    const otherTeacher = await User.create({
      name: 'Karim Sir',
      email: 'karim@test.local',
      roles: [UserRole.TEACHER],
      accountStatus: AccountStatus.ACTIVE,
      isEmailVerified: true,
      tokenVersion: 1,
    });
    otherTeacherToken = signAccessToken({
      sub: otherTeacher._id.toString(),
      roles: [UserRole.TEACHER],
      tokenVersion: 1,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  let createdTuitionId = '';
  let studentId = '';

  it('POST /tuitions creates a tuition with schedule and initializes Cycle 1', async () => {
    const res = await request(app)
      .post('/api/v1/tuitions')
      .set('Cookie', [`th_access_token=${teacherToken}`])
      .set('X-Requested-With', 'tutorhub')
      .send({
        students: [
          {
            name: 'Abrar Fahim',
            classGrade: 'Class 9',
            subjects: ['Physics', 'Higher Math'],
          },
        ],
        scheduleConfig: {
          billingModel: BillingModel.MONTHLY_CYCLE,
          targetDaysPerCycle: 12,
          weeklyDays: [WeekDay.SUN, WeekDay.TUE, WeekDay.THU],
          durationMinutes: 90,
        },
        monthlyFee: 8000,
        guardianName: 'Dr. Fahim Ahmed',
        guardianPhone: '01711223344',
        guardianEmail: 'fahim.parent@test.local',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tuition.title).toContain('Abrar Fahim');
    expect(res.body.data.tuition.currentCycle.cycleNumber).toBe(1);
    expect(res.body.data.tuition.currentCycle.completedDays).toBe(0);
    expect(res.body.data.tuition.students).toHaveLength(1);

    createdTuitionId = res.body.data.tuition._id;
    studentId = res.body.data.tuition.students[0]._id;
  });

  it('GET /tuitions returns the list of tuitions for the teacher', async () => {
    const res = await request(app)
      .get('/api/v1/tuitions')
      .set('Cookie', [`th_access_token=${teacherToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.tuitions).toHaveLength(1);
    expect(res.body.data.tuitions[0]._id).toBe(createdTuitionId);
  });

  it('GET /tuitions/:id rejects unauthorized teachers with 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/v1/tuitions/${createdTuitionId}`)
      .set('Cookie', [`th_access_token=${otherTeacherToken}`]);

    expect(res.status).toBe(403);
  });

  it('GET /tuitions/:id/sessions/prefill returns initial student skeleton for new tuition', async () => {
    const res = await request(app)
      .get(`/api/v1/tuitions/${createdTuitionId}/sessions/prefill`)
      .set('Cookie', [`th_access_token=${teacherToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.entries).toHaveLength(1);
    expect(res.body.data.entries[0].studentName).toBe('Abrar Fahim');
    expect(res.body.data.entries[0].unfinishedTopics).toBeUndefined();
  });

  it('POST /tuitions/:id/sessions logs Day 1 and advances completedDays count', async () => {
    const res = await request(app)
      .post(`/api/v1/tuitions/${createdTuitionId}/sessions`)
      .set('Cookie', [`th_access_token=${teacherToken}`])
      .set('X-Requested-With', 'tutorhub')
      .send({
        clientRequestId: 'req-session-test-001',
        sessionDate: new Date().toISOString(),
        sessionLocalDate: '2026-10-21',
        startTime: '16:00',
        durationMinutes: 90,
        sessionType: 'REGULAR',
        entries: [
          {
            studentId,
            attendance: AttendanceStatus.PRESENT,
            subject: 'Physics',
            topicsTaught: 'Newtonian Mechanics - Laws 1 & 2',
            unfinishedTopics: 'Third Law and Conservation of Momentum',
            homeworkAssigned: 'Exercise 3.1 - Problems 1 to 10',
            nextClassPlan: 'Rocket Propulsion & Momentum problem solving',
          },
        ],
        guardianVisibleRemarks: 'Very attentive today. Solved problem 4 independently.',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.session.sessionNumberInCycle).toBe(1);

    // Verify tuition cycle progress in database
    const tuition = await Tuition.findById(createdTuitionId);
    expect(tuition?.currentCycle.completedDays).toBe(1);
    expect(tuition?.currentCycle.readyToClose).toBe(false);
  });

  it('GET /tuitions/:id/sessions/prefill now returns Day 1 unfinished topics and homework for Next-Day Memory', async () => {
    const res = await request(app)
      .get(`/api/v1/tuitions/${createdTuitionId}/sessions/prefill`)
      .set('Cookie', [`th_access_token=${teacherToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.lastSessionDate).toBe('2026-10-21');
    expect(res.body.data.lastSessionNumber).toBe(1);
    expect(res.body.data.entries[0].unfinishedTopics).toBe('Third Law and Conservation of Momentum');
    expect(res.body.data.entries[0].homeworkAssigned).toBe('Exercise 3.1 - Problems 1 to 10');
    expect(res.body.data.entries[0].nextClassPlan).toBe('Rocket Propulsion & Momentum problem solving');
  });

  it('POST /tuitions/:id/sessions with same clientRequestId is idempotent (zero duplicate sessions)', async () => {
    const res = await request(app)
      .post(`/api/v1/tuitions/${createdTuitionId}/sessions`)
      .set('Cookie', [`th_access_token=${teacherToken}`])
      .set('X-Requested-With', 'tutorhub')
      .send({
        clientRequestId: 'req-session-test-001', // same idempotency key
        sessionDate: new Date().toISOString(),
        sessionLocalDate: '2026-10-21',
        sessionType: 'REGULAR',
        entries: [
          {
            studentId,
            attendance: AttendanceStatus.PRESENT,
            subject: 'Physics',
          },
        ],
      });

    expect(res.status).toBe(201);
    // Completed days must still be 1 (NOT 2)
    const tuition = await Tuition.findById(createdTuitionId);
    expect(tuition?.currentCycle.completedDays).toBe(1);
  });

  it('POST /tuitions/:id/record-payment records payment and marks status PARTIAL then PAID', async () => {
    // 1. Partial payment of 4000
    const res1 = await request(app)
      .post(`/api/v1/tuitions/${createdTuitionId}/record-payment`)
      .set('Cookie', [`th_access_token=${teacherToken}`])
      .set('X-Requested-With', 'tutorhub')
      .send({
        amount: 4000,
        method: PaymentMethod.BKASH,
        reference: 'TRX987654321',
        note: 'Half payment via bKash',
      });

    expect(res1.status).toBe(200);
    expect(res1.body.data.tuition.currentCycle.amountPaid).toBe(4000);
    expect(res1.body.data.tuition.currentCycle.paymentStatus).toBe(PaymentStatus.PARTIAL);

    // 2. Full payment remaining 4000
    const res2 = await request(app)
      .post(`/api/v1/tuitions/${createdTuitionId}/record-payment`)
      .set('Cookie', [`th_access_token=${teacherToken}`])
      .set('X-Requested-With', 'tutorhub')
      .send({
        amount: 4000,
        method: PaymentMethod.CASH,
        advanceCycle: true, // Advance to Cycle 2
      });

    expect(res2.status).toBe(200);
    // Advanced to Cycle 2
    expect(res2.body.data.tuition.currentCycle.cycleNumber).toBe(2);
    expect(res2.body.data.tuition.currentCycle.completedDays).toBe(0);
    expect(res2.body.data.tuition.currentCycle.paymentStatus).toBe(PaymentStatus.PENDING);

    // Verify CycleHistory has archived Cycle 1
    const history = await CycleHistory.findOne({
      tuitionId: createdTuitionId,
      cycleNumber: 1,
    });
    expect(history).toBeDefined();
    expect(history?.amountPaid).toBe(8000);
    expect(history?.feeCharged).toBe(8000);
  });

  it('POST /tuitions/:id/share-token generates secure guardian share token and PIN', async () => {
    const res = await request(app)
      .post(`/api/v1/tuitions/${createdTuitionId}/share-token`)
      .set('Cookie', [`th_access_token=${teacherToken}`])
      .set('X-Requested-With', 'tutorhub')
      .send({
        accessPin: '4321',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.shareToken).toHaveLength(64);
    expect(res.body.data.accessPin).toBe('4321');
    expect(res.body.data.linkUrl).toContain('/guardian/view/');

    // In DB, token & PIN must be securely hashed
    const tuition = await Tuition.findById(createdTuitionId);
    expect(tuition?.guardianAccess.shareTokenHash).toBeDefined();
    expect(tuition?.guardianAccess.shareTokenHash).not.toBe(res.body.data.shareToken);
    expect(tuition?.guardianAccess.accessPinHash).toBeDefined();
    expect(tuition?.guardianAccess.accessPinHash).not.toBe('4321');
  });

  it('POST /tuitions creates a tuition with multiple students from different/same classes', async () => {
    const res = await request(app)
      .post('/api/v1/tuitions')
      .set('Cookie', [`th_access_token=${teacherToken}`])
      .set('X-Requested-With', 'tutorhub')
      .send({
        students: [
          {
            name: 'Sadia Khan',
            classGrade: 'Class 8',
            subjects: ['General Science', 'Math'],
          },
          {
            name: 'Sami Khan',
            classGrade: 'Class 10',
            subjects: ['Physics', 'Chemistry'],
          },
        ],
        scheduleConfig: {
          billingModel: BillingModel.FIXED_WEEKLY,
          targetDaysPerCycle: 12,
          weeklyDays: [WeekDay.SAT, WeekDay.MON, WeekDay.WED],
          durationMinutes: 90,
        },
        monthlyFee: 15000,
        guardianName: 'Mrs. Khan',
        guardianPhone: '01799887766',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tuition.students).toHaveLength(2);
    expect(res.body.data.tuition.students[0].name).toBe('Sadia Khan');
    expect(res.body.data.tuition.students[0].classGrade).toBe('Class 8');
    expect(res.body.data.tuition.students[1].name).toBe('Sami Khan');
    expect(res.body.data.tuition.students[1].classGrade).toBe('Class 10');
    expect(res.body.data.tuition.title).toContain('Sadia Khan, Sami Khan');
    expect(res.body.data.tuition.title).toContain('Class 8, Class 10');
  });
});
