import { redirect } from 'next/navigation'

import AdminArticleCreatePageClient from '@/components/admin/article/AdminArticleCreatePageClient'
import { checkAdminAccess } from '@/guard/adminGuard'
import { generateLocaleParams, type LocaleParams } from '@/lib/generation/staticParams'

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic'

export default async function CreateArticlePage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params

	// Check admin access
	const adminUser = await checkAdminAccess()

	if (!adminUser) {
		redirect(`/not-found`)
	}

	return <AdminArticleCreatePageClient currentUser={adminUser} locale={locale} />
}
