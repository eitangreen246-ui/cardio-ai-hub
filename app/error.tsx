"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="text-sm text-soft">
        The last action didn&apos;t go through — usually a brief network or database hiccup.
      </p>
      <button className="btn btn-blue btn-solid" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
