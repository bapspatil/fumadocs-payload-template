export default function Loading() {
  return (
    <div
      aria-label="Loading content"
      aria-live="polite"
      className="animate-pulse p-4 md:p-8"
      role="status"
    >
      <div className="mb-4 h-6 w-40 rounded bg-muted" />
      <div className="mb-6 h-8 w-64 rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
      <span className="sr-only">Loading documentation...</span>
    </div>
  );
}
