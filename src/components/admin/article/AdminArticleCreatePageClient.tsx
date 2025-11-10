'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import translations from '@/components/admin/article/locales/article-form.locales.json'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import type { Article } from '@/models/article.model'
import type { User } from '@/models/user.model'

import ArticleCreationForm from './ArticleCreationForm'

interface AdminArticleCreatePageClientProps {
	currentUser: null | User
	locale: Locale
}

export default function AdminArticleCreatePageClient({
	locale,
	currentUser,
}: Readonly<AdminArticleCreatePageClientProps>) {
	const t = getTranslations(locale, translations)
	const router = useRouter()
	const [isSuccess, setIsSuccess] = useState(false)
	const [createdArticle, setCreatedArticle] = useState<null | Article>(null)

	const handleSuccess = (article: Article) => {
		setCreatedArticle(article)
		setIsSuccess(true)
	}

	const handleCancel = () => {
		router.push(`/${locale}/admin/article`)
	}

	// Safety check - if currentUser is null, show error
	if (!currentUser) {
		return (
			<div className="from-background via-destructive/5 to-background relative min-h-screen bg-linear-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--destructive)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--destructive)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-red-600 dark:text-red-400">⚠</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">{t.pageClient.accessError}</h1>
						<p className="text-muted-foreground mb-6 text-lg">{t.pageClient.accessErrorDescription}</p>
						<button
							type="button"
							className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
							onClick={() => router.push('/auth/sign-in')}
						>
							{t.pageClient.signIn}
						</button>
					</div>
				</div>
			</div>
		)
	}

	if (isSuccess && createdArticle) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-green-600 dark:text-green-400">✓</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">{t.pageClient.successTitle}</h1>
						<p className="text-muted-foreground mb-6 text-lg">
							{t.pageClient.successDescription.replace('{title}', createdArticle.title)}
						</p>
						<button
							type="button"
							className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
							onClick={() => router.push(`/${locale}/admin/article`)}
						>
							{t.pageClient.backToArticles}
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div>
			{/* Admin header with user info */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">{t.pageClient.connectedAs}</p>
						<p className="text-foreground font-medium">
							{currentUser.firstName ?? 'Anonymous'} {currentUser.lastName ?? ''} ({currentUser.email})
						</p>
					</div>
					<div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
						{currentUser.role.toUpperCase()}
					</div>
				</div>
			</div>
			<ArticleCreationForm locale={locale} onCancel={handleCancel} onSuccess={handleSuccess} />
		</div>
	)
}
