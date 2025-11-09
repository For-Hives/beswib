import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getArticleByIdAction } from '@/app/[locale]/admin/article/actions'
import ArticleEditForm from '@/components/admin/article/ArticleEditForm'
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

export default async function EditArticlePage({ params }: { params: Promise<LocaleParams & { id: string }> }) {
	const { locale, id } = await params

	// Check admin access
	const adminUser = await checkAdminAccess()

	if (!adminUser) {
		redirect(`/not-found`)
	}

	// Fetch the article
	const result = await getArticleByIdAction(id)

	if (!result.success || !result.data) {
		redirect(`/${locale}/admin/article`)
	}

	return <ArticleEditForm article={result.data} locale={locale} />
}
