'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitBranch,
  Settings,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Repositories', href: '/dashboard', icon: GitBranch },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Repo Ghost Hunter
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <button className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <LogOut className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
          Sign out
        </button>
      </div>
    </div>
  );
}
