import { z } from 'zod';

export const verifySharePinSchema = z
  .object({
    pin: z.string().min(4, 'PIN must be at least 4 digits').max(8),
  })
  .strict();
