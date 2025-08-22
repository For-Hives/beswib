import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/guard/adminGuard'

import AdminOrganizerCreatePageClient from '@/components/admin/organizer/AdminOrganizerCreatePageClient'
import { generateLocaleParams, LocaleParams } from '@/lib/generation/staticParams'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function AdminOrganizerCreatePage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	// Check admin access without throwing redirect errors
	const adminUser = await checkAdminAccess()

	// Handle redirection manually if not admin
	if (!adminUser) {
		redirect(`/${locale}/auth/sign-in?redirectUrl=${encodeURIComponent(`/${locale}/admin`)}`)
	}

	return <AdminOrganizerCreatePageClient currentUser={adminUser} locale={locale} />
}
