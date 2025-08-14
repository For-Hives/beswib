import { requireAdminAccess } from '@/guard/adminGuard'

import AdminEventPageClient from '@/components/admin/event/AdminEventPageClient'
import { generateLocaleParams, LocaleParams } from '@/lib/generation/staticParams'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function AdminEventCreatePage({ params }: { params: Promise<LocaleParams> }) {
	// Verify admin access before rendering the page
	// This will automatically redirect if user is not authenticated or not admin
	const adminUser = await requireAdminAccess()

	const { locale } = await params

	return <AdminEventPageClient currentUser={adminUser} locale={locale} />
}
