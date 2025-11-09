'use client'

import { localeFlags, type Locale } from '@/lib/i18n/config'
import type { Article } from '@/models/article.model'

interface ArticleTranslationIndicatorProps {
	article: Article
	compact?: boolean
}

export default function ArticleTranslationIndicator({ article, compact = false }: ArticleTranslationIndicatorProps) {
	// Simple mode: just show the current article's locale
	// We don't fetch all translations to avoid performance issues
	const currentLocale = article.locale

	// If locale is undefined or not valid, show N/A
	if (!currentLocale || !(currentLocale in localeFlags)) {
		return (
			<div className="flex items-center gap-1 text-xs text-muted-foreground">
				<span>N/A</span>
			</div>
		)
	}

	if (compact) {
		// Compact mode: just show current language
		return (
			<div className="flex items-center gap-1 text-xs text-muted-foreground">
				<span>{localeFlags[currentLocale as Locale]}</span>
			</div>
		)
	}

	// Full mode: show current language flag with tooltip
	return (
		<div className="flex flex-wrap items-center gap-1" title={`Language: ${currentLocale.toUpperCase()}`}>
			<span className="text-base" title={currentLocale.toUpperCase()}>
				{localeFlags[currentLocale as Locale]}
			</span>
			{article.translationGroup && (
				<span className="text-muted-foreground text-xs" title="Part of translation group">
					•
				</span>
			)}
		</div>
	)
}
