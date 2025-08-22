import { checkAdminAccess } from '@/guard/adminGuard'
import { redirect } from 'next/navigation'

import AdminOrganizerEditPageClient from '@/components/admin/organizer/AdminOrganizerEditPageClient'
import { generateLocaleParams, LocaleParams } from '@/lib/generation/staticParams'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function AdminOrganizerEditPage({ params }: { params: Promise<LocaleParams & { id: string }> }) {
	const { locale, id } = await params

	// Check admin access without throwing redirect errors
	const adminUser = await checkAdminAccess()

	// Handle redirection manually if not admin
	if (!adminUser) {
		redirect(`/${locale}/auth/sign-in?redirectUrl=${encodeURIComponent(`/${locale}/admin`)}`)
	}

	return <AdminOrganizerEditPageClient currentUser={adminUser} locale={locale} organizerId={id} />
}
