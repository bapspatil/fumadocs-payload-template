export default function Loading() {
	return (
		<div
			className="p-4 md:p-8 animate-pulse"
			role="status"
			aria-live="polite"
			aria-label="Loading content"
		>
			<div className="h-6 w-40 mb-4 bg-muted rounded" />
			<div className="h-8 w-64 mb-6 bg-muted rounded" />
			<div className="space-y-3">
				<div className="h-4 w-full bg-muted rounded" />
				<div className="h-4 w-5/6 bg-muted rounded" />
				<div className="h-4 w-2/3 bg-muted rounded" />
			</div>
			<span className="sr-only">Loading documentation...</span>
		</div>
	);
}
