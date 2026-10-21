import { z } from 'zod';
import { ContactVisibilityMode } from '../enums/index.js';

export const updateTeacherProfileSchema = z
  .object({
    isPublic: z.boolean().optional(),
    institution: z.string().max(100).optional(),
    department: z.string().max(100).optional(),
    batchOrYear: z.string().max(50).optional(),
    experienceYears: z.number().min(0).max(50).optional(),
    bio: z.string().max(1000).optional(),
    subjectsOffered: z.array(z.string().min(1).max(50)).optional(),
    preferredAreas: z.array(z.string().min(1).max(100)).optional(),
    expectedRateRange: z.string().max(100).optional(),
    contactVisibilityMode: z.nativeEnum(ContactVisibilityMode).optional(),
  })
  .strict();

export const submitVerificationSchema = z
  .object({
    docs: z
      .array(
        z.object({
          url: z.string().url('Valid document URL is required'),
          publicId: z.string().min(1),
          docType: z.string().min(1),
        })
      )
      .min(1, 'At least one verification document is required'),
  })
  .strict();
