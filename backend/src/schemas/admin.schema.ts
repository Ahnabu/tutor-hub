import { z } from 'zod';

export const reviewVerificationSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().max(500).optional(),
});

export const updateSystemConfigSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  requireAdminApprovalForPosts: z.boolean().optional(),
  forceManualApproval: z.boolean().optional(),
  contactRequestDailyLimit: z.number().min(1).max(100).optional(),
});

export type ReviewVerificationInput = z.infer<typeof reviewVerificationSchema>;
export type UpdateSystemConfigInput = z.infer<typeof updateSystemConfigSchema>;
