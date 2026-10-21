import { z } from 'zod';

export const createMarketplacePostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  classGrade: z.string().min(1, 'Class or Grade is required'),
  curriculum: z.string().optional(),
  subjects: z.array(z.string().min(1)).min(1, 'At least one subject is required'),
  area: z.string().min(2, 'Area is required'),
  city: z.string().default('Dhaka'),
  mode: z.enum(['IN_PERSON', 'ONLINE', 'HYBRID']).default('IN_PERSON'),
  daysPerWeek: z.coerce.number().min(1).max(7).optional(),
  targetDaysPerMonth: z.coerce.number().min(1).max(31).optional(),
  budgetAmount: z.coerce.number().min(500, 'Minimum budget is 500 BDT'),
  genderPreference: z.enum(['MALE', 'FEMALE', 'ANY']).default('ANY'),
});

export const applyMarketplacePostSchema = z.object({
  message: z.string().min(5, 'Application pitch or message must be at least 5 characters').max(1000),
});

export const respondMarketplaceApplicationSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT']),
});

export const marketplaceFilterSchema = z.object({
  search: z.string().optional(),
  area: z.string().optional(),
  subject: z.string().optional(),
  mode: z.enum(['IN_PERSON', 'ONLINE', 'HYBRID']).optional(),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export type CreateMarketplacePostInput = z.infer<typeof createMarketplacePostSchema>;
export type ApplyMarketplacePostInput = z.infer<typeof applyMarketplacePostSchema>;
export type RespondMarketplaceApplicationInput = z.infer<typeof respondMarketplaceApplicationSchema>;
export type MarketplaceFilterInput = z.infer<typeof marketplaceFilterSchema>;
