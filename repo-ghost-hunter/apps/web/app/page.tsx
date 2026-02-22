import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 lg:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-center">
        <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
          Repo Ghost Hunter
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Monitor GitHub repository activity and detect inactive or unhealthy repositories
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
