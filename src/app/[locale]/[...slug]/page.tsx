import { notFound } from 'next/navigation'

import type { Locale } from '@/lib/i18n/config'

export default async function CatchAllNotFound({ params }: { params: Promise<{ locale: Locale; slug: string[] }> }) {
	await params
	notFound()
}
