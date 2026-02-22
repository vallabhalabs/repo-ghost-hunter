export default function RepoDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Repository Details</h1>
      <p className="text-gray-600">Repository ID: {params.id}</p>
      <div className="mt-8 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Repository Information</h2>
          <p className="text-gray-600 dark:text-gray-400">Repository details will appear here</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Charts</h2>
          <p className="text-gray-600 dark:text-gray-400">Charts will appear here</p>
        </div>
      </div>
    </div>
  );
}
