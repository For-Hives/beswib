'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getArticleTranslationsAction } from '@/app/[locale]/admin/article/actions'
import { i18n, type Locale, localeFlags } from '@/lib/i18n/config'
import type { Article } from '@/models/article.model'

interface ArticleTranslationTabsProps {
	translationGroup?: string
	currentLocale: Locale
	onLocaleChange: (locale: Locale, article?: Article) => void
	refreshTrigger?: number // Increment this to trigger a refresh
}

export default function ArticleTranslationTabs({
	translationGroup,
	currentLocale,
	onLocaleChange,
	refreshTrigger = 0,
}: ArticleTranslationTabsProps) {
	const [translations, setTranslations] = useState<Article[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const fetchTranslations = async () => {
			if (!translationGroup) {
				setTranslations([])
				return
			}

			setLoading(true)
			try {
				const result = await getArticleTranslationsAction(translationGroup)
				if (result.success && result.data) {
					setTranslations(result.data)
				} else {
					toast.error(result.error || 'Failed to fetch translations')
				}
			} catch (error) {
				console.error('Error fetching translations:', error)
				toast.error('Failed to fetch translations')
			} finally {
				setLoading(false)
			}
		}

		void fetchTranslations()
	}, [translationGroup, refreshTrigger])

	// Create a map of locale to article for quick lookup
	const translationMap = new Map<Locale, Article>()
	for (const translation of translations) {
		translationMap.set(translation.locale, translation)
	}

	return (
		<div className="mb-8">
			<div className="flex items-center gap-2">
				<h3 className="text-foreground text-lg font-semibold">Translations:</h3>
				{loading && <Loader2 className="h-4 w-4 animate-spin" />}
			</div>
			<div className="mt-4 flex flex-wrap gap-2">
				{i18n.locales.map(locale => {
					const hasTranslation = translationMap.has(locale)
					const isCurrentLocale = locale === currentLocale
					const article = translationMap.get(locale)

					return (
						<button
							key={locale}
							type="button"
							onClick={() => onLocaleChange(locale, article)}
							disabled={loading}
							className={`
								flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all
								${
									isCurrentLocale
										? 'border-primary bg-primary text-primary-foreground shadow-md'
										: hasTranslation
											? 'border-border bg-card hover:bg-accent hover:text-accent-foreground'
											: 'border-dashed border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50'
								}
								${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
							`}
						>
							<span className="text-lg">{localeFlags[locale]}</span>
							<span className="uppercase">{locale}</span>
							{hasTranslation && !isCurrentLocale && (
								<span className="ml-1 h-2 w-2 rounded-full bg-green-500" title="Translation exists" />
							)}
							{!hasTranslation && !isCurrentLocale && (
								<span className="ml-1 h-2 w-2 rounded-full bg-gray-400" title="No translation yet" />
							)}
						</button>
					)
				})}
			</div>
			<p className="text-muted-foreground mt-2 text-sm">
				{translationGroup
					? `Translation group: ${translationGroup.substring(0, 8)}... (${translations.length} translation${translations.length !== 1 ? 's' : ''})`
					: 'Create article to enable translations'}
			</p>
		</div>
	)
}
