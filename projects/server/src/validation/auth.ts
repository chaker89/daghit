import { z } from 'zod';

export const credentials = z.object({
  email: z.email().max(254).transform(value => value.toLowerCase()),
  password: z.string().min(10).max(128),
});

export const signup = credentials.extend({
  name: z.string().trim().min(1).max(120),
  onboardingPreference: z.enum(['member', 'owner']),
});
