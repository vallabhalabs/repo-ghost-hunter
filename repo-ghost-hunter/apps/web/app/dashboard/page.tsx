export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Repositories</h2>
          <p className="text-gray-600 dark:text-gray-400">Repository list will appear here</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Health Scores</h2>
          <p className="text-gray-600 dark:text-gray-400">Health scores will appear here</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Activity</h2>
          <p className="text-gray-600 dark:text-gray-400">Activity charts will appear here</p>
        </div>
      </div>
    </div>
  );
}
