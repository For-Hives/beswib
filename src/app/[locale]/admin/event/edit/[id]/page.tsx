import { checkAdminAccess } from '@/guard/adminGuard'
import { redirect } from 'next/navigation'

import AdminEventEditPageClient from '@/components/admin/event/AdminEventEditPageClient'
import { generateLocaleParams, LocaleParams } from '@/lib/generation/staticParams'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function AdminEventEditPage({ params }: { params: Promise<LocaleParams & { id: string }> }) {
	const { locale, id } = await params

	// Check admin access without throwing redirect errors
	const adminUser = await checkAdminAccess()

	// Handle redirection manually if not admin
	if (!adminUser) {
		redirect(`/not-found`)
	}

	return <AdminEventEditPageClient currentUser={adminUser} locale={locale} eventId={id} />
}
