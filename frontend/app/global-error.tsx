"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-terrain px-6 text-ink">
          <div className="max-w-sm text-center">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-ink-muted">
              A critical runtime error occurred. Retry to reload this view.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 rounded-none bg-parchment px-5 py-2 text-sm font-semibold text-parchment transition-colors hover:bg-parchment-deep"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
