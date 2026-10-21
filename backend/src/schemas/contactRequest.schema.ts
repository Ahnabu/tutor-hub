import { z } from 'zod';

export const createContactRequestSchema = z
  .object({
    targetTeacherId: z.string().min(1, 'Target teacher ID is required'),
    reasonOrNote: z.string().max(500).optional(),
  })
  .strict();

export const respondContactRequestSchema = z
  .object({
    action: z.enum(['APPROVE', 'REJECT']),
  })
  .strict();
