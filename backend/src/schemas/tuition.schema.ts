import { z } from 'zod';
import {
  BillingModel,
  WeekDay,
  PaymentStatus,
  PaymentMethod,
  TuitionStatus,
} from '../enums/index.js';

export const studentSubdocSchema = z
  .object({
    name: z.string().min(2).max(100),
    classGrade: z.string().min(1).max(50),
    curriculum: z.string().max(50).optional(),
    subjects: z.array(z.string().min(1).max(50)).min(1),
    isActive: z.boolean().default(true),
  })
  .strict();

export const scheduleConfigSchema = z
  .object({
    billingModel: z.nativeEnum(BillingModel).default(BillingModel.MONTHLY_CYCLE),
    targetDaysPerCycle: z.number().int().min(1).max(31).default(12),
    weeklyDays: z.array(z.nativeEnum(WeekDay)).min(1),
    preferredTime: z.string().max(20).optional(),
    durationMinutes: z.number().int().min(15).max(360).default(90),
    extraClassCountsTowardCycle: z.boolean().default(true),
    makeupCountsTowardCycle: z.boolean().default(true),
  })
  .strict();

export const createTuitionSchema = z
  .object({
    title: z.string().min(2).max(100).optional(),
    students: z.array(studentSubdocSchema).min(1),
    scheduleConfig: scheduleConfigSchema,
    monthlyFee: z.number().positive(),
    cycleStartDate: z.string().datetime().optional(),
    guardianName: z.string().max(100).optional(),
    guardianPhone: z.string().regex(/^(\+?880|0)?1[3-9]\d{8}$/, 'Valid Bangladeshi mobile number required').optional(),
    guardianEmail: z.string().email().optional(),
    teacherNotes: z.string().max(1000).optional(),
  })
  .strict();

export const updateTuitionSchema = z
  .object({
    title: z.string().min(2).max(100).optional(),
    status: z.nativeEnum(TuitionStatus).optional(),
    students: z.array(studentSubdocSchema).optional(),
    scheduleConfig: scheduleConfigSchema.partial().optional(),
    monthlyFee: z.number().positive().optional(),
    guardianName: z.string().max(100).optional(),
    guardianPhone: z.string().regex(/^(\+?880|0)?1[3-9]\d{8}$/).optional(),
    guardianEmail: z.string().email().optional(),
    teacherNotes: z.string().max(1000).optional(),
  })
  .strict();

export const recordPaymentSchema = z
  .object({
    amount: z.number().positive(),
    method: z.nativeEnum(PaymentMethod),
    paidAt: z.string().datetime().optional(),
    reference: z.string().max(100).optional(),
    note: z.string().max(500).optional(),
    advanceCycle: z.boolean().default(false),
  })
  .strict();

export const generateShareTokenSchema = z
  .object({
    accessPin: z.string().regex(/^\d{4,6}$/, 'Access PIN must be 4 to 6 numeric digits').optional(),
  })
  .strict();
