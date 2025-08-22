import { checkAdminAccess } from '@/guard/adminGuard'
import { redirect } from 'next/navigation'

import { generateLocaleParams, LocaleParams } from '@/lib/generation/staticParams'
import AdminEventPageClient from '@/components/admin/event/AdminEventPageClient'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function AdminEventCreatePage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	// Check admin access without throwing redirect errors
	const adminUser = await checkAdminAccess()

	// Handle redirection manually if not admin
	if (!adminUser) {
		redirect(`/not-found`)
	}

	return <AdminEventPageClient currentUser={adminUser} locale={locale} />
}
