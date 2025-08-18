import { requireAdminAccess } from '@/guard/adminGuard'

import AdminEventEditPageClient from '@/components/admin/event/AdminEventEditPageClient'
import { generateLocaleParams, LocaleParams } from '@/lib/generation/staticParams'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function AdminEventEditPage({ params }: { params: Promise<LocaleParams & { id: string }> }) {
	// Verify admin access before rendering the page
	// This will automatically redirect if user is not authenticated or not admin
	const adminUser = await requireAdminAccess()

	const { locale, id } = await params

	return <AdminEventEditPageClient currentUser={adminUser} locale={locale} eventId={id} />
}
