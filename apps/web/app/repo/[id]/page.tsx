export default function RepoDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Repository Details</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Repository ID: {params.id}
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Repository Information</h2>
          <p className="text-gray-600 dark:text-gray-400">Repository details will appear here</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Activity Charts</h2>
          <p className="text-gray-600 dark:text-gray-400">Charts will appear here</p>
        </div>
      </div>
    </div>
  );
}
