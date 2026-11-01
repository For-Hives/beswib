/**
 * Whether the site may say its data is fictional. Off until the real records have been replaced
 * (scripts/archive/README.md). Next.js writes the value in at build time: changing it means a rebuild.
 */
export function isDataFictional(): boolean {
	return process.env.NEXT_PUBLIC_ARCHIVE_DATA_FICTIONAL === 'true'
}
