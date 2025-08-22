import { checkAdminAccess } from '@/guard/adminGuard'
import { redirect } from 'next/navigation'

import AdminDashboardClient from '@/components/admin/dashboard/AdminDashboardClient'
import { generateLocaleParams, LocaleParams } from '@/lib/generation/staticParams'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	// Check admin access without throwing redirect errors
	const adminUser = await checkAdminAccess()

	// Handle redirection manually if not admin
	if (!adminUser) {
		redirect(`/${locale}/auth/sign-in?redirectUrl=${encodeURIComponent(`/${locale}/admin`)}`)
	}

	return <AdminDashboardClient currentUser={adminUser} locale={locale} />
}
