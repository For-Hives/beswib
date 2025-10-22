'use client'

import { ArrowUp } from 'lucide-react'
import ScrollToTop from 'react-scroll-to-top'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { cn } from '@/lib/utils'

import translations from './locales.json'

const CustomIcon = ({ className }: { className?: string }) => (
	<div
		className={cn(
			'h-11 w-11 rounded-full shadow-lg transition-all duration-300',
			'sm:h-12 sm:w-12',
			'bg-background/90 border-border/60 border backdrop-blur-md',
			'hover:bg-background/95 hover:scale-110 hover:shadow-xl',
			'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2',
			'active:scale-95',
			'dark:bg-background/95 dark:border-border/40',
			'flex items-center justify-center',
			className
		)}
	>
		<ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
	</div>
)

interface GoBackToTopProps {
	/**
	 * Current locale for translation
	 */
	readonly locale: Locale
	/**
	 * Scroll threshold in pixels. When the user scrolls past this point,
	 * the button becomes visible. Default is 100px.
	 */
	readonly threshold?: number
	/**
	 * Additional CSS classes to apply to the button container
	 */
	readonly className?: string
}

/**
 * A floating "go back to top" button using react-scroll-to-top library.
 * Features:
 * - Only visible after scrolling past a threshold
 * - Smooth scroll behavior
 * - Tooltip with translated text
 * - Responsive design with improved mobile experience
 * - Accessible with keyboard navigation
 * - Automatic internationalization
 */
export function GoBackToTop({ threshold = 100, locale, className }: GoBackToTopProps) {
	// Get translations for the current locale
	const t = getTranslations(locale, translations)

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div>
					<ScrollToTop
						smooth
						top={threshold}
						component={<CustomIcon />}
						style={{
							zIndex: 50,
							right: '1rem',
							position: 'fixed',
							padding: 0,
							bottom: '1rem',
							border: 'none',
							backgroundColor: 'transparent',
						}}
					/>
				</div>
			</TooltipTrigger>
			<TooltipContent side="left" sideOffset={12} className="hidden sm:block">
				<p className="text-sm font-medium">{t.goBackToTop}</p>
			</TooltipContent>
		</Tooltip>
	)
}
