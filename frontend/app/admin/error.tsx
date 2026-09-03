"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-parchment">
      <div className="max-w-sm text-center">
        <p className="label mb-3">Registry Office</p>
        <h1 className="display text-2xl text-ink">This view failed to render</h1>
        <p className="mt-3 text-sm text-ink-muted">
          Retry to reload the section. If it keeps failing, check that the API is reachable.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 border border-vermilion bg-vermilion px-5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground transition-colors duration-[120ms] hover:bg-vermilion-deep"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
