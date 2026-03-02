import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/auth';

export interface AnalyticsOverview {
  total_repositories: number;
  healthy_repositories: number;
  at_risk_repositories: number;
  critical_repositories: number;
  average_health_score: number;
  last_synced_at: string;
}

export interface Repository {
  id: string;
  github_repo_id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  last_commit_at: string;
  open_pr_count: number;
  open_issue_count: number;
  health_score: number;
  updated_at: string;
  created_at: string;
  user_id: string;
}

export interface PaginatedRepositories {
  data: Repository[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ActivityTrend {
  buckets: Array<{
    range: string;
    count: number;
  }>;
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => fetchWithAuth<AnalyticsOverview>('/analytics/overview'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRepositories(page: number = 1, limit: number = 20, status?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  return useQuery({
    queryKey: ['analytics', 'repos', page, limit, status],
    queryFn: () => fetchWithAuth<PaginatedRepositories>(`/analytics/repos?${params}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useActivityTrend() {
  return useQuery({
    queryKey: ['analytics', 'activity-trend'],
    queryFn: () => fetchWithAuth<ActivityTrend>('/analytics/activity-trend'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
