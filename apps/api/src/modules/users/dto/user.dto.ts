import { z } from 'zod';

export const CreateUserDataSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  accessToken: z.string().min(1, 'Access token is required'),
});

export const UpdateUserDataSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  accessToken: z.string().min(1, 'Access token is required').optional(),
});

export type CreateUserData = z.infer<typeof CreateUserDataSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserDataSchema>;
