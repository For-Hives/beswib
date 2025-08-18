export default function Loading() {
	return (
		<div className="container mx-auto max-w-3xl animate-pulse p-4">
			<header className="mb-8 text-center">
				<div className="mx-auto mb-2 h-8 w-1/2 rounded bg-gray-300 dark:bg-neutral-700" />
				<div className="mx-auto h-4 w-1/4 rounded bg-gray-200 dark:bg-neutral-800" />
			</header>

			<section className="mb-8 rounded-lg border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-800">
				<div className="mb-4 h-6 w-1/3 rounded bg-gray-200 dark:bg-neutral-700" />
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-neutral-700" />
					<div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-neutral-700" />
					<div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-neutral-700" />
				</div>
			</section>

			<section className="mb-8 rounded-lg border bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-800">
				<div className="mb-4 h-6 w-1/3 rounded bg-gray-200 dark:bg-neutral-700" />
				<div className="space-y-4">
					<div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-700" />
					<div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-700" />
					<div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-700" />
					<div className="h-10 w-1/3 rounded bg-gray-300 dark:bg-neutral-700" />
				</div>
			</section>

			<div className="mt-8 text-center">
				<div className="mx-auto h-4 w-1/4 rounded bg-gray-200 dark:bg-neutral-700" />
			</div>
		</div>
	)
}
