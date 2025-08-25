'use client'

import { useState, useEffect } from 'react'

import { useLocale } from '@/hooks/useLocale'

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
	const { isUpdating, currentLocale: locale, changeLocale } = useLocale(currentLocale)

	const currentLanguage = languages.find(lang => lang.code === locale) ?? languages[0]

	const handleLanguageChange = async (newLocale: string) => {
		try {
			setIsOpen(false)
			await changeLocale(newLocale)
		} catch (error) {
			console.error('Error changing language:', error)
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

		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [])

	return (
		<div className="language-selector relative">
			<button
				className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-2 hover:bg-gray-50 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				onClick={() => setIsOpen(!isOpen)}
				aria-label="Select language"
				aria-expanded={isOpen}
				aria-haspopup="true"
				disabled={isUpdating}
			>
				<span>{currentLanguage.flag}</span>
				<span className="hidden sm:inline">{currentLanguage.name}</span>
				<span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
				<svg
					className={`ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isOpen && (
				<div className="absolute bottom-full left-0 mb-2 w-full min-w-[140px] rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
					<div className="py-1">
						{languages.map(language => (
							<button
								className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 ${
									locale === language.code
										? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
										: 'text-gray-700 dark:text-gray-300'
								}`}
								key={language.code}
								onClick={() => void handleLanguageChange(language.code)}
								disabled={isUpdating}
							>
								<span>{language.flag}</span>
								<span>{language.name}</span>
								{locale === language.code && (
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
