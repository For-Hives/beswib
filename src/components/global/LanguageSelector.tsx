'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { useUser } from '@clerk/nextjs'

import { updateUserLocalePreference } from '@/app/[locale]/actions/locale'

interface Language {
	code: string
	flag: string
	name: string
}

const languages: Language[] = [
	{ name: 'English', flag: '🇺🇸', code: 'en' },
	{ name: 'Français', flag: '🇫🇷', code: 'fr' },
	{ name: 'Español', flag: '🇪🇸', code: 'es' },
	{ name: 'Italiano', flag: '🇮🇹', code: 'it' },
	{ name: 'Deutsch', flag: '🇩🇪', code: 'de' },
	{ name: 'Română', flag: '🇷🇴', code: 'ro' },
	{ name: 'Português', flag: '🇵🇹', code: 'pt' },
	{ name: 'Nederlands', flag: '🇳🇱', code: 'nl' },
	{ name: '한국어', flag: '🇰🇷', code: 'ko' },
]

interface LanguageSelectorProps {
	currentLocale?: string
}

export default function LanguageSelector({ currentLocale = 'en' }: LanguageSelectorProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedLocale, setSelectedLocale] = useState(currentLocale)
	const [isUpdating, setIsUpdating] = useState(false)
	const { isSignedIn } = useUser()

	const currentLanguage = languages.find(lang => lang.code === selectedLocale) ?? languages[0]

	const handleLanguageChange = async (newLocale: string) => {
		try {
			setIsUpdating(true)

			// Set cookie to persist language preference 🍪
			document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=lax`

			setSelectedLocale(newLocale)
			setIsOpen(false)

			// If user is signed in, update their locale preference in the database
			if (isSignedIn === true) {
				const result = await updateUserLocalePreference(newLocale)
				if (!result.success) {
					console.warn('Failed to update user locale preference:', result.error)
					// Continue with the UI update even if the database update fails
				}
			}

			// replace the current URL with the new locale (  /en/path/to/page -> /fr/path/to/page ) 🔄
			const url = new URL(window.location.href)
			const pathSegments = url.pathname.split('/').filter(Boolean)
			// Replace the first segment (current locale) with the new locale ➡️
			if (pathSegments.length > 0 && languages.some(lang => lang.code === pathSegments[0])) {
				pathSegments[0] = newLocale
			} else {
				pathSegments.unshift(newLocale)
			}
			url.pathname = '/' + pathSegments.join('/')
			window.history.replaceState({}, '', url.toString())
			// Reload the page to apply the new locale 🔁
			window.location.reload()
		} catch (error) {
			console.error('Error changing language:', error)
			setIsUpdating(false)
		}
	}

	// Close dropdown when clicking outside 🖱️
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement
			if (!target.closest('.language-selector')) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('click', handleClickOutside)
			return () => document.removeEventListener('click', handleClickOutside)
		}
	}, [isOpen])

	return (
		<div className="language-selector relative">
			<button
				aria-expanded={isOpen}
				aria-haspopup="true"
				aria-label="Select language"
				className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
				onClick={() => setIsOpen(!isOpen)}
				disabled={isUpdating}
			>
				<span className="flex items-center gap-1">
					<span>{currentLanguage.flag}</span>
					<span className="hidden sm:inline">{currentLanguage.name}</span>
				</span>
				<ChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={14} />
			</button>

			{isOpen && (
				<div className="absolute bottom-full left-0 mb-2 w-full min-w-[140px] rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
					<div className="py-1">
						{languages.map(language => (
							<button
								className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 ${
									selectedLocale === language.code
										? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
										: 'text-gray-700 dark:text-gray-300'
								}`}
								key={language.code}
								onClick={() => void handleLanguageChange(language.code)}
								disabled={isUpdating}
							>
								<span>{language.flag}</span>
								<span>{language.name}</span>
								{selectedLocale === language.code && (
									<span className="ml-auto text-blue-600 dark:text-blue-400">{isUpdating ? '⏳' : '✓'}</span>
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
