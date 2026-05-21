export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-sage">
          PuzzleShare
        </h1>
        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-sage px-4 py-2 text-white hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
