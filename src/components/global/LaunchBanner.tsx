/** biome-ignore-all lint/suspicious/noDocumentCookie: <we are doing that to handle cookies on
 * the client side, for languages synchronization and promotion banner dismissal> */
'use client'

import { X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

import { useThemeStore } from '@/hooks/useTheme'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { cn } from '@/lib/utils'

import pageTranslationsData from './locales.json'

function Grid({
	theme = 'light',
	strokeWidth = 1,
	patternOffset = [0, 0],
	className,
	cellSize = 12,
}: {
	cellSize?: number
	strokeWidth?: number
	patternOffset?: [number, number]
	className?: string
	theme?: 'light' | 'dark'
}) {
	const id = useId()

	return (
		<svg
			className={cn(
				'pointer-events-none absolute inset-0',
				theme === 'dark' ? 'text-white/75' : 'text-black/50',
				className
			)}
			width="100%"
			height="100%"
		>
			<defs>
				<pattern
					id={`grid-${id}`}
					x={patternOffset[0] - 1}
					y={patternOffset[1] - 1}
					width={cellSize}
					height={cellSize}
					patternUnits="userSpaceOnUse"
				>
					<path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="transparent" stroke="#fff" strokeWidth={strokeWidth} />
				</pattern>
			</defs>
			<rect fill={`url(#grid-${id})`} width="100%" height="100%" />
		</svg>
	)
}

interface LaunchBannerProps {
	locale: Locale
}

export function LaunchBanner({ locale }: LaunchBannerProps) {
	const [show, setShow] = useState(true)
	const [isLoading, setIsLoading] = useState(true)
	const { theme } = useThemeStore()

	// Get translations for the banner
	const t = getTranslations(locale, pageTranslationsData)

	// Check if banner was dismissed in localStorage/cookies on component mount
	useEffect(() => {
		// Check localStorage first (faster)
		const bannerDismissed = localStorage.getItem('banner_dismissed') === 'true'

		// Also check cookies as fallback
		const cookieDismissed = document.cookie.split(';').some(cookie => cookie.trim().startsWith('banner_dismissed='))

		if (bannerDismissed || cookieDismissed) {
			setShow(false)
		}

		setIsLoading(false)
	}, [])

	// Function to dismiss banner and save to localStorage and cookies
	const dismissBanner = () => {
		setShow(false)
		// Save to localStorage (faster access)
		localStorage.setItem('banner_dismissed', 'true')
		// Also save to cookies as fallback
		const expires = new Date()
		expires.setDate(expires.getDate() + 30)
		document.cookie = `banner_dismissed=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
	}

	// Don't render anything while loading to prevent header flash
	if (isLoading) return null

	// Don't render if banner is dismissed
	if (!show) return null

	return (
		<div
			className={cn(
				'relative isolate mx-auto flex flex-row items-center overflow-hidden border-b px-4 py-3 sm:py-2',
				theme === 'dark'
					? 'border-green-500/20 bg-gradient-to-r from-slate-800/90 to-slate-900/90'
					: 'border-green-600/15 bg-gradient-to-r from-lime-100/80 to-emerald-100/80'
			)}
		>
			<div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-3">
				<Grid
					cellSize={13}
					patternOffset={[0, -1]}
					theme={theme}
					className={cn(
						'mix-blend-overlay md:[mask-image:linear-gradient(to_right,black_60%,transparent)]',
						theme === 'dark'
							? '[mask-image:linear-gradient(to_right,white,transparent)] text-white/40'
							: '[mask-image:linear-gradient(to_right,black,transparent)] text-black/30'
					)}
				/>

				<div className="flex w-fit items-center justify-center gap-3">
					<p className={cn('text-sm', theme === 'dark' ? 'text-white' : 'text-gray-900')}>{t?.banner?.title}</p>
				</div>

				<button
					type="button"
					className={cn(
						'cursor-pointer p-2 text-sm underline transition-colors',
						theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-700 hover:text-red-900'
					)}
					onClick={dismissBanner}
				>
					<X className="h-[16px] w-[16px]" />
				</button>
			</div>
		</div>
	)
}
