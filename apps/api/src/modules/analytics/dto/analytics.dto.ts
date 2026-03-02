import { z } from 'zod';

// Overview DTO
export const AnalyticsOverviewSchema = z.object({
  total_repositories: z.number(),
  healthy_repositories: z.number(),
  at_risk_repositories: z.number(),
  critical_repositories: z.number(),
  average_health_score: z.number(),
  last_synced_at: z.string().datetime(),
});

export type AnalyticsOverview = z.infer<typeof AnalyticsOverviewSchema>;

// Repository list DTO
export const RepositoryAnalyticsSchema = z.object({
  id: z.string(),
  github_repo_id: z.number(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  default_branch: z.string(),
  last_commit_at: z.string().datetime(),
  open_pr_count: z.number(),
  open_issue_count: z.number(),
  health_score: z.number(),
  updated_at: z.string().datetime(),
  created_at: z.string().datetime(),
  user_id: z.string(),
});

export type RepositoryAnalytics = z.infer<typeof RepositoryAnalyticsSchema>;

// Activity trend DTO
export const ActivityTrendBucketSchema = z.object({
  range: z.string(),
  count: z.number(),
});

export const ActivityTrendSchema = z.object({
  buckets: z.array(ActivityTrendBucketSchema),
});

export type ActivityTrend = z.infer<typeof ActivityTrendSchema>;

// Query DTOs
export const AnalyticsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['healthy', 'at_risk', 'critical']).optional(),
});

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;

// Pagination DTO
export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Paginated response
export const PaginatedRepositoriesResponseSchema = z.object({
  data: z.array(RepositoryAnalyticsSchema),
  pagination: PaginationSchema,
});

export type PaginatedRepositoriesResponse = z.infer<typeof PaginatedRepositoriesResponseSchema>;
