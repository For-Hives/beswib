'use client'

import { useEffect, useState } from 'react'
import { localeFlags, type Locale } from '@/lib/i18n/config'
import type { Article } from '@/models/article.model'
import { getArticleTranslationsAction } from '@/app/[locale]/admin/article/actions'
import { Loader2 } from 'lucide-react'

interface ArticleTranslationIndicatorProps {
	article: Article
	compact?: boolean
}

export default function ArticleTranslationIndicator({ article, compact = false }: ArticleTranslationIndicatorProps) {
	const [translations, setTranslations] = useState<Article[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const fetchTranslations = async () => {
			if (!article.translationGroup) {
				setTranslations([article])
				return
			}

			setLoading(true)
			try {
				const result = await getArticleTranslationsAction(article.translationGroup)
				if (result.success && result.data) {
					setTranslations(result.data)
				} else {
					setTranslations([article])
				}
			} catch (error) {
				console.error('Error fetching translations:', error)
				setTranslations([article])
			} finally {
				setLoading(false)
			}
		}

		void fetchTranslations()
	}, [article])

	// Create a set of available locales
	const availableLocales = new Set(translations.map(t => t.locale))

	if (loading) {
		return (
			<div className="flex items-center gap-1">
				<Loader2 className="h-3 w-3 animate-spin" />
			</div>
		)
	}

	if (compact) {
		// Compact mode: just show count of translations
		return (
			<div className="flex items-center gap-1 text-xs text-muted-foreground">
				<span>{translations.length}</span>
				<span>lang{translations.length !== 1 ? 's' : ''}</span>
			</div>
		)
	}

	// Full mode: show all language flags
	return (
		<div className="flex flex-wrap items-center gap-1" title={`Available in ${translations.length} language(s)`}>
			{Array.from(availableLocales).map(locale => (
				<span key={locale} className="text-base" title={locale.toUpperCase()}>
					{localeFlags[locale as Locale]}
				</span>
			))}
		</div>
	)
}
