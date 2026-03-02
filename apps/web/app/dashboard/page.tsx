export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Monitor your GitHub repositories and track their health
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Repositories</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total repositories</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Health Score</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average health</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Stale Items</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">PRs and issues</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Repository List</h2>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No repositories found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Connect your GitHub account to start monitoring repositories
          </p>
        </div>
      </div>
    </div>
  );
}
