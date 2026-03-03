'use client';

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { OrganizationFilter } from '@/components/dashboard/OrganizationFilter';
import { useAnalyticsOverview, useRepositories } from '@/hooks/use-analytics';
import { fetchWithAuth } from '@/lib/auth';

export default function DashboardPage() {
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useAnalyticsOverview(selectedOrganization);
  const { data: repos, isLoading: reposLoading, refetch: refetchRepos } = useRepositories(1, 20, undefined, selectedOrganization);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetchWithAuth('/sync/trigger');
      await refetchOverview();
      await refetchRepos();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOrganizationChange = (orgId: string | null) => {
    setSelectedOrganization(orgId);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Monitor your GitHub repositories and track their health
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <OrganizationFilter
              selectedOrganization={selectedOrganization}
              onOrganizationChange={handleOrganizationChange}
            />
            
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>
      
      <OverviewCards data={overview} isLoading={overviewLoading} />

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Repository List
          </h2>
        </div>
        
        {reposLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading repositories...</p>
          </div>
        ) : repos?.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Commit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Open PRs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Open Issues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Health Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {repos.data.map((repo) => (
                  <tr key={repo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {repo.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {repo.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(repo.last_commit_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {repo.open_pr_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {repo.open_issue_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        repo.health_score > 75 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : repo.health_score >= 40 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {repo.health_score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {selectedOrganization ? 'No repositories found for this organization' : 'No repositories found'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              {selectedOrganization 
                ? 'Try syncing the organization or select a different one'
                : 'Connect your GitHub account to start monitoring repositories'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
