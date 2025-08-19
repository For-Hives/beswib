'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utils'

import translations from './locales.json'

interface GoBackToTopProps {
	/**
	 * Current locale for translation
	 */
	locale: Locale
	/**
	 * Scroll threshold in pixels. When the user scrolls past this point,
	 * the button becomes visible. Default is 300px.
	 */
	threshold?: number
	/**
	 * Additional CSS classes to apply to the button container
	 */
	className?: string
}

/**
 * A floating "go back to top" button that appears when the user scrolls down.
 * Features:
 * - Only visible after scrolling past a threshold
 * - Smooth scroll animation to top
 * - Tooltip with translated text
 * - Responsive design
 * - Accessible with keyboard navigation
 * - Automatic internationalization
 */
export function GoBackToTop({ threshold = 300, locale, className }: GoBackToTopProps) {
	const [isVisible, setIsVisible] = useState(false)

	// Get translations for the current locale
	const t = getTranslations(locale, translations)

	useEffect(() => {
		const toggleVisibility = () => {
			if (window.scrollY > threshold) {
				setIsVisible(true)
			} else {
				setIsVisible(false)
			}
		}

		// Add scroll event listener
		window.addEventListener('scroll', toggleVisibility)

		// Clean up the event listener on component unmount
		return () => {
			window.removeEventListener('scroll', toggleVisibility)
		}
	}, [threshold])

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		})
	}

	if (!isVisible) {
		return null
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					onClick={scrollToTop}
					size="icon"
					variant="outline"
					className={cn(
						'fixed right-6 bottom-6 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl',
						'bg-background/80 border-border/50 backdrop-blur-sm',
						'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2',
						className
					)}
					aria-label={t.goBackToTop}
				>
					<ArrowUp className="h-5 w-5" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="left" sideOffset={10}>
				<p className="text-sm font-medium">{t.goBackToTop}</p>
			</TooltipContent>
		</Tooltip>
	)
}
