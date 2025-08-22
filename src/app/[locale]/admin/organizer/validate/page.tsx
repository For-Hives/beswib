import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/guard/adminGuard'

import AdminOrganizerValidatePageClient from '@/components/admin/organizer/AdminOrganizerValidatePageClient'
import { generateLocaleParams, LocaleParams } from '@/lib/generation/staticParams'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function AdminOrganizerValidatePage({ params }: { params: Promise<LocaleParams> }) {
	// Verify admin access before rendering the page
	// This will automatically redirect if user is not authenticated or not admin
	const { locale } = await params
	
	// Check admin access without throwing redirect errors
	const adminUser = await checkAdminAccess()
	
	// Handle redirection manually if not admin
	if (!adminUser) {
		redirect(`/${locale}/auth/sign-in?redirectUrl=${encodeURIComponent(`/${locale}/admin`)}`)
	}

	const { locale } = await params

	return <AdminOrganizerValidatePageClient currentUser={adminUser} locale={locale} />
}
