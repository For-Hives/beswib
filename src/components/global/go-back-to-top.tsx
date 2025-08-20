'use client'

import { useCallback, useEffect, useState } from 'react'
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
	 * the button becomes visible. Default is 100px.
	 */
	threshold?: number
	/**
	 * Additional CSS classes to apply to the button container
	 */
	className?: string
	/**
	 * Show immediately when user starts scrolling (even before threshold)
	 */
	showOnScroll?: boolean
}

/**
 * A floating "go back to top" button that appears when the user scrolls down.
 * Features:
 * - Only visible after scrolling past a threshold or immediately when scrolling starts
 * - Smooth scroll animation to top with optimized performance
 * - Tooltip with translated text
 * - Responsive design with improved mobile experience
 * - Accessible with keyboard navigation
 * - Automatic internationalization
 * - Throttled scroll events for better performance
 * - Smooth fade-in/out animations
 */
export function GoBackToTop({ threshold = 100, showOnScroll = true, locale, className }: GoBackToTopProps) {
	const [isVisible, setIsVisible] = useState(false)
	const [isAnimating, setIsAnimating] = useState(false)

	// Get translations for the current locale
	const t = getTranslations(locale, translations)

	// Throttle function to improve scroll performance
	const throttle = useCallback(<T extends unknown[]>(func: (...args: T) => void, limit: number) => {
		let inThrottle: boolean
		return function (...args: T) {
			if (!inThrottle) {
				func(...args)
				inThrottle = true
				setTimeout(() => (inThrottle = false), limit)
			}
		}
	}, [])

	const toggleVisibility = useCallback(() => {
		const scrolled = window.scrollY
		const shouldShow = showOnScroll ? scrolled > 10 : scrolled > threshold

		if (shouldShow && !isVisible) {
			setIsVisible(true)
		} else if (!shouldShow && isVisible) {
			setIsVisible(false)
		}
	}, [threshold, showOnScroll, isVisible])

	// Create throttled version of toggleVisibility
	const throttledToggleVisibility = useCallback(throttle(toggleVisibility, 100), [toggleVisibility, throttle])

	useEffect(() => {
		// Add scroll event listener with throttling
		window.addEventListener('scroll', throttledToggleVisibility, { passive: true })

		// Check initial scroll position
		toggleVisibility()

		// Clean up the event listener on component unmount
		return () => {
			window.removeEventListener('scroll', throttledToggleVisibility)
		}
	}, [throttledToggleVisibility, toggleVisibility])

	const scrollToTop = useCallback(() => {
		setIsAnimating(true)

		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		})

		// Reset animation state after scroll completes
		setTimeout(() => {
			setIsAnimating(false)
		}, 800)
	}, [])

	return (
		<>
			{isVisible && (
				<div className="fixed right-4 bottom-4 z-[999999] sm:right-6 sm:bottom-6">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								onClick={scrollToTop}
								size="icon"
								variant="outline"
								disabled={isAnimating}
								className={cn(
									'h-11 w-11 rounded-full shadow-lg transition-all duration-300',
									'sm:h-12 sm:w-12',
									'bg-background/90 border-border/60 backdrop-blur-md',
									'hover:bg-background/95 hover:scale-110 hover:shadow-xl',
									'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2',
									'active:scale-95',
									isAnimating && 'animate-pulse',
									'dark:bg-background/95 dark:border-border/40',
									className
								)}
								aria-label={t.goBackToTop}
							>
								<ArrowUp
									className={cn(
										'h-4 w-4 transition-transform duration-200',
										'sm:h-5 sm:w-5',
										isAnimating && 'scale-90'
									)}
								/>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="left" sideOffset={12} className="hidden sm:block">
							<p className="text-sm font-medium">{t.goBackToTop}</p>
						</TooltipContent>
					</Tooltip>
				</div>
			)}
		</>
	)
}
