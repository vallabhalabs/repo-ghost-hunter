'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useOrganizations } from '@/hooks/use-organizations';

interface OrganizationFilterProps {
  selectedOrganization: string | null;
  onOrganizationChange: (orgId: string | null) => void;
}

export function OrganizationFilter({ selectedOrganization, onOrganizationChange }: OrganizationFilterProps) {
  const { data: organizations, isLoading } = useOrganizations();

  return (
    <div className="relative">
      <select
        value={selectedOrganization || ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onOrganizationChange(e.target.value || null)}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
        disabled={isLoading}
      >
        <option value="">Personal Repositories</option>
        {organizations?.map((org) => (
          <option key={org.id} value={org.id}>
            {org.login} ({org._count.repositories} repos)
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
