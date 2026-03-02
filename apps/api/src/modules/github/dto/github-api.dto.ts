import { z } from 'zod';

// GitHub API Response DTOs
export const GitHubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  default_branch: z.string(),
  updated_at: z.string().datetime(),
  owner: z.object({
    login: z.string(),
    id: z.number(),
    avatar_url: z.string().url().optional(),
  }),
});

export const GitHubPullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.string(),
  user: z.object({
    login: z.string(),
    id: z.number(),
    avatar_url: z.string().url().optional(),
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  head: z.object({
    ref: z.string(),
    sha: z.string(),
  }),
  base: z.object({
    ref: z.string(),
    sha: z.string(),
  }),
});

export const GitHubIssueSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.string(),
  user: z.object({
    login: z.string(),
    id: z.number(),
    avatar_url: z.string().url().optional(),
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const GitHubCommitSchema = z.object({
  sha: z.string(),
  commit: z.object({
    author: z.object({
      name: z.string(),
      email: z.string().email().optional(),
      date: z.string().datetime(),
    }),
    message: z.string(),
  }),
  url: z.string().url(),
});

export const GitHubRateLimitSchema = z.object({
  resources: z.object({
    core: z.object({
      limit: z.number(),
      remaining: z.number(),
      reset: z.string(),
      used: z.number(),
    }),
  }),
  rate: z.object({
    limit: z.number(),
    remaining: z.number(),
    reset: z.string(),
    used: z.number(),
  }),
});

export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;
export type GitHubPullRequest = z.infer<typeof GitHubPullRequestSchema>;
export type GitHubIssue = z.infer<typeof GitHubIssueSchema>;
export type GitHubCommit = z.infer<typeof GitHubCommitSchema>;
export type GitHubRateLimit = z.infer<typeof GitHubRateLimitSchema>;
