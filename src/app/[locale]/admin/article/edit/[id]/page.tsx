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

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size:[24px_24px]"></div>

			<div className="relative pt-12 pb-12">
				<div className="container mx-auto max-w-4xl p-6">
					<ArticleEditForm article={result.data} locale={locale} />
				</div>
			</div>
		</div>
	)
}
