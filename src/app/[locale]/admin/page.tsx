import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/components/admin/dashboard/AdminDashboardClient'
import { checkAdminAccess } from '@/guard/adminGuard'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'
import { generateAdminMetadata } from '@/lib/seo'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }): Promise<Metadata> {
	const { locale } = await params
	return generateAdminMetadata(locale)
}

export default async function AdminDashboardPage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	// Check admin access without throwing redirect errors
	const adminUser = await checkAdminAccess()

	// Handle redirection manually if not admin
	if (!adminUser) {
		redirect(`/not-found`)
	}

	return <AdminDashboardClient currentUser={adminUser} locale={locale} />
}
