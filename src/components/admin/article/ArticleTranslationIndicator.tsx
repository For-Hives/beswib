'use client'

import { Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { type Locale, localeFlags } from '@/lib/i18n/config'
import type { Article } from '@/models/article.model'

interface ArticleTranslationIndicatorProps {
	article: Article & { translationCount?: number }
	compact?: boolean
}

export default function ArticleTranslationIndicator({ article, compact = false }: ArticleTranslationIndicatorProps) {
	const currentLocale = article.locale
	const translationCount = article.translationCount || 1
	const totalLanguages = 9

	// If locale is undefined or not valid, show N/A
	if (!currentLocale || !(currentLocale in localeFlags)) {
		return (
			<div className="flex items-center gap-1 text-xs text-muted-foreground">
				<span>N/A</span>
			</div>
		)
	}

	if (compact) {
		// Compact mode: show flag and count
		return (
			<div className="flex items-center gap-1.5">
				<span className="text-base">{localeFlags[currentLocale as Locale]}</span>
				{translationCount > 1 && (
					<Badge variant="secondary" className="h-5 px-1.5 text-xs font-medium">
						+{translationCount - 1}
					</Badge>
				)}
			</div>
		)
	}

	// Full mode: show detailed translation status
	const completionPercentage = Math.round((translationCount / totalLanguages) * 100)
	const isComplete = translationCount === totalLanguages
	const isPartial = translationCount > 1 && translationCount < totalLanguages
	const isOnlyFrench = translationCount === 1

	return (
		<div className="flex items-center gap-2">
			<span className="text-lg" title={currentLocale.toUpperCase()}>
				{localeFlags[currentLocale as Locale]}
			</span>
			<div className="flex items-center gap-1.5">
				<Globe
					className={`h-4 w-4 ${
						isComplete
							? 'text-green-600 dark:text-green-400'
							: isPartial
								? 'text-orange-600 dark:text-orange-400'
								: 'text-muted-foreground'
					}`}
				/>
				<Badge
					variant={isComplete ? 'default' : isPartial ? 'secondary' : 'outline'}
					className="h-6 px-2 text-xs font-medium"
					title={`${translationCount} out of ${totalLanguages} languages (${completionPercentage}%)`}
				>
					{translationCount}/{totalLanguages}
				</Badge>
			</div>
		</div>
	)
}
