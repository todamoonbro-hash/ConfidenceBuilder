"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-6 max-w-md shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <span className="text-lg font-bold text-red-600">!</span>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-red-900">Something went wrong</h1>
            <p className="mt-1 text-sm text-red-800">We encountered an issue loading this view. This has been logged.</p>
            
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={reset}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 active:bg-red-800 transition-colors"
              >
                Try again
              </button>
              <a
                href="/"
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-50 transition-colors text-center"
              >
                Return home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
