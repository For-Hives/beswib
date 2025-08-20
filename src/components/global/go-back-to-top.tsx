'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUp } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utils'

import translations from './locales.json'

// Animation-frame-based throttle to keep scroll handler responsive and cheap
const rAFThrottle = <T extends unknown[]>(func: (...args: T) => void) => {
	let scheduled = false
	return (...args: T) => {
		if (scheduled) return
		scheduled = true
		requestAnimationFrame(() => {
			func(...args)
			scheduled = false
		})
	}
}

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
	/**
	 * Show immediately when user starts scrolling (even before threshold)
	 */
	readonly showOnScroll?: boolean
	/**
	 * Optional safety fallback in ms to reset animation state if the scroll event
	 * doesn't fire when reaching the top (e.g., browser quirks). Default 2000ms.
	 */
	readonly animationResetTimeoutMs?: number
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
export function GoBackToTop({
	threshold = 100,
	showOnScroll = true,
	locale,
	className,
	animationResetTimeoutMs = 2000,
}: GoBackToTopProps) {
	const [isVisible, setIsVisible] = useState(false)
	const [isAnimating, setIsAnimating] = useState(false)

	// Get translations for the current locale
	const t = getTranslations(locale, translations)

	const toggleVisibility = useCallback(() => {
		const scrolled = window.scrollY
		// Hide strictly when back at the very top; otherwise apply threshold logic
		const shouldShow = showOnScroll ? scrolled > 0 : scrolled > threshold
		setIsVisible(prev => (prev !== shouldShow ? shouldShow : prev))
	}, [threshold, showOnScroll])

	// Create throttled version of toggleVisibility (animation-frame throttled)
	const throttledToggleVisibility = useMemo(() => rAFThrottle(toggleVisibility), [toggleVisibility])

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

		// Reset animation state when scroll reaches the top
		let fallbackTimeoutId: number | undefined
		const handleScroll = () => {
			if (window.scrollY === 0) {
				setIsAnimating(false)
				window.removeEventListener('scroll', handleScroll)
				if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId)
			}
		}
		window.addEventListener('scroll', handleScroll, { passive: true })
		// Safety fallback in case the browser doesn't fire the event as expected
		fallbackTimeoutId = window.setTimeout(() => {
			setIsAnimating(false)
			window.removeEventListener('scroll', handleScroll)
		}, animationResetTimeoutMs)
	}, [animationResetTimeoutMs])

	return (
		<>
			{isVisible && (
				<div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
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
