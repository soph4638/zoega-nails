"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="mb-4 text-ink/80">{error.message || "Der skete en uventet fejl."}</p>
      <button
        onClick={reset}
        className="rounded-full bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-dark"
      >
        Prøv igen
      </button>
    </div>
  );
}
