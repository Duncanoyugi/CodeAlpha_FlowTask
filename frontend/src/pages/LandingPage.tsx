const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-6">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">TaskFlow</h1>
          <p className="mt-3 text-lg text-gray-600">
            Project management that keeps your team in sync.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
          <p className="text-sm text-gray-600 leading-relaxed">
            This is the <span className="font-semibold text-indigo-700">TaskFlow</span> workspace environment.
            Use it to organize boards, track tasks, and coordinate work across workspaces and projects.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <a
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign in
          </a>
          <a
            href="/register"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Create account
          </a>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          TaskFlow &middot; Workspace management platform
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
