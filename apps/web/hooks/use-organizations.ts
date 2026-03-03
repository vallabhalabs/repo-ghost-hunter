import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/auth';

export interface Organization {
  id: string;
  login: string;
  avatarUrl?: string;
  createdAt: string;
  _count: {
    repositories: number;
  };
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => fetchWithAuth<Organization[]>('/orgs'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useOrganization(orgId: string) {
  return useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => fetchWithAuth<Organization>(`/orgs/${orgId}`),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
