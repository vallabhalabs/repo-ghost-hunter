import { z } from 'zod';

export const GitHubUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  email: z.string().optional(),
  name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  access_token: z.string().optional(),
  emails: z.array(z.object({
    email: z.string(),
    verified: z.boolean(),
    primary: z.boolean().optional(),
  })).optional(),
});

export type GitHubUser = z.infer<typeof GitHubUserSchema>;
