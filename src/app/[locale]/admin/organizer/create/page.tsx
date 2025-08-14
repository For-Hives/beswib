import { requireAdminAccess } from '@/guard/adminGuard'

import AdminOrganizerCreatePageClient from '@/components/admin/organizer/AdminOrganizerCreatePageClient'
import { generateLocaleParams, LocaleParams } from '@/lib/generation/staticParams'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function AdminOrganizerCreatePage({ params }: { params: Promise<LocaleParams> }) {
	// Verify admin access before rendering the page
	// This will automatically redirect if user is not authenticated or not admin
	const adminUser = await requireAdminAccess()

	const { locale } = await params

	return <AdminOrganizerCreatePageClient currentUser={adminUser} locale={locale} />
}
