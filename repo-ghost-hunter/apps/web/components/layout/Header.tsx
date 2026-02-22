'use client';

import { Bell, Search, User } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search repositories..."
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <button className="flex items-center gap-2 rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
