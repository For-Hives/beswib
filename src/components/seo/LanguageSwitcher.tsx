'use client'

import { Languages } from 'lucide-react'
import { useState } from 'react'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

import type { Locale } from '@/lib/i18n/config'

import { updateUserLocalePreference } from '@/app/[locale]/actions/locale'

interface LanguageSwitcherProps {
	currentLocale: Locale
	currentPath: string
	className?: string
}

// Language configuration with native names
const languages = {
	ro: { native: 'Română', name: 'Romanian', flag: '🇷🇴' },
	pt: { native: 'Português', name: 'Portuguese', flag: '🇵🇹' },
	nl: { native: 'Nederlands', name: 'Dutch', flag: '🇳🇱' },
	ko: { native: '한국어', name: 'Korean', flag: '🇰🇷' },
	it: { native: 'Italiano', name: 'Italian', flag: '🇮🇹' },
	fr: { native: 'Français', name: 'French', flag: '🇫🇷' },
	es: { native: 'Español', name: 'Spanish', flag: '🇪🇸' },
	en: { native: 'English', name: 'English', flag: '🇺🇸' },
	de: { native: 'Deutsch', name: 'German', flag: '🇩🇪' },
}

export default function LanguageSwitcher({ currentPath, currentLocale, className = '' }: LanguageSwitcherProps) {
	const router = useRouter()
	const { isSignedIn } = useUser()
	const [isUpdating, setIsUpdating] = useState(false)

	// Extract path without locale
	const pathWithoutLocale = currentPath.replace(`/${currentLocale}`, '') || '/'

	// Fallback for invalid locale
	const safeLocale = currentLocale in languages ? currentLocale : 'en'
	const currentLang = languages[safeLocale]

	const handleLanguageChange = async (newLocale: string) => {
		try {
			setIsUpdating(true)

			// If user is signed in, update their locale preference in the database
			if (isSignedIn === true) {
				const result = await updateUserLocalePreference(newLocale)
				if (!result.success) {
					console.warn('Failed to update user locale preference:', result.error)
					// Continue with navigation even if DB update fails
				}
			}

			// Navigate to the new locale URL
			const href = newLocale === 'en' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`
			router.push(href)
		} catch (error) {
			console.error('Error changing language:', error)
			setIsUpdating(false)
		}
	}

	return (
		<div className={`group relative ${className}`}>
			<button
				className="border-border bg-background hover:bg-accent/10 flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
				aria-label="Select language"
				aria-expanded="false"
				aria-haspopup="true"
			>
				<Languages className="h-4 w-4" />
				<span className="hidden sm:inline">{currentLang.native}</span>
				<span className="sm:hidden">{currentLang.flag}</span>
			</button>

			<div className="bg-background border-border invisible absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
				<div className="p-2">
					<div className="space-y-1 py-2">
						{Object.entries(languages).map(([code, lang]) => {
							const isCurrent = code === currentLocale

							return (
								<button
									key={code}
									onClick={() => !isCurrent && !isUpdating && void handleLanguageChange(code)}
									disabled={isCurrent || isUpdating}
									className={`flex w-full items-center gap-3 rounded-md px-3 py-2 transition-colors ${
										isCurrent
											? 'bg-primary/10 text-primary font-medium'
											: 'hover:bg-accent/10 text-foreground disabled:cursor-not-allowed disabled:opacity-50'
									}`}
									lang={code}
									aria-current={isCurrent ? 'true' : undefined}
								>
									<span className="text-lg">{lang.flag}</span>
									<div className="flex-1 text-left">
										<div className="font-medium">{lang.native}</div>
										<div className="text-muted-foreground text-xs">{lang.name}</div>
									</div>
									{isCurrent && <div className="bg-primary h-2 w-2 rounded-full" />}
									{isUpdating && code === currentLocale && <div className="text-xs">⏳</div>}
								</button>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}

// Alternative component for small screens (dropdown)
export function LanguageSwitcherMobile({ currentPath, currentLocale }: LanguageSwitcherProps) {
	const router = useRouter()
	const { isSignedIn } = useUser()
	const [isUpdating, setIsUpdating] = useState(false)

	const pathWithoutLocale = currentPath.replace(`/${currentLocale}`, '') || '/'

	const handleLanguageChange = async (newLocale: string) => {
		try {
			setIsUpdating(true)

			// If user is signed in, update their locale preference in the database
			if (isSignedIn === true) {
				const result = await updateUserLocalePreference(newLocale)
				if (!result.success) {
					console.warn('Failed to update user locale preference:', result.error)
					// Continue with navigation even if DB update fails
				}
			}

			// Navigate to the new locale URL
			const href = newLocale === 'en' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`
			router.push(href)
		} catch (error) {
			console.error('Error changing language:', error)
			setIsUpdating(false)
		}
	}

	return (
		<div className="border-border flex flex-wrap gap-2 border-t p-4">
			<div className="text-muted-foreground mb-2 w-full text-xs font-medium">Language / Langue</div>

			{Object.entries(languages).map(([code, lang]) => {
				const isCurrent = code === currentLocale

				return (
					<button
						key={code}
						onClick={() => !isCurrent && !isUpdating && void handleLanguageChange(code)}
						disabled={isCurrent || isUpdating}
						className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
							isCurrent
								? 'bg-primary text-primary-foreground border-primary'
								: 'bg-background text-foreground border-border hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-50'
						}`}
						lang={code}
						aria-current={isCurrent ? 'true' : undefined}
					>
						<span>{lang.flag}</span>
						<span className="text-sm font-medium">{lang.native}</span>
						{isUpdating && code === currentLocale && <span className="ml-1 text-xs">⏳</span>}
					</button>
				)
			})}
		</div>
	)
}
