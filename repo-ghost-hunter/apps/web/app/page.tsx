export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Repo Ghost Hunter
        </h1>
        <p className="text-center text-gray-600">
          Monitor GitHub repository activity and detect inactive or unhealthy repositories
        </p>
      </div>
    </main>
  );
}
