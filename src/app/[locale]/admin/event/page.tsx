import { requireAdminAccess } from '@/guard/adminGuard'

import AdminEventsPageClient from '@/components/admin/event/AdminEventsPageClient'
import { generateLocaleParams, LocaleParams } from '@/lib/generation/staticParams'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function AdminEventsPage({ params }: { params: Promise<LocaleParams> }) {
	// Verify admin access before rendering the page
	// This will automatically redirect if user is not authenticated or not admin
	const adminUser = await requireAdminAccess()

	const { locale } = await params

	return <AdminEventsPageClient currentUser={adminUser} locale={locale} />
}
