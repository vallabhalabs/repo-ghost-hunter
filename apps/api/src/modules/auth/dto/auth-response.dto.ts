import { z } from 'zod';

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    avatar: z.string().url().optional(),
  }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
