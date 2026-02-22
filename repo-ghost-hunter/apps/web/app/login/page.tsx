export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">
            Sign in to Repo Ghost Hunter
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect with GitHub to get started
          </p>
        </div>
        <div className="mt-8">
          <button className="group relative flex w-full justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700">
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
