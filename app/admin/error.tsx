"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-white">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold">Admin panel error</h1>
        <p className="mt-2 text-sm text-zinc-400">
          This admin view failed to render. Retry to reload the section.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
