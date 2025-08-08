'use client'

import { useThemeStore } from '@/hooks/useTheme'
import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { theme, setTheme } = useThemeStore()

	useEffect(() => {
		// Hydrate theme from system preference on first mount if no persisted value yet
		if (typeof window !== 'undefined') {
			const persisted = window.localStorage.getItem('theme')
			if (!persisted) {
				const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
				setTheme(prefersDark ? 'dark' : 'light')
			}
		}
		// run only once to set initial theme if not persisted
	}, [])

	useEffect(() => {
		document.documentElement.classList.remove('light', 'dark')
		document.documentElement.classList.add(theme)
	}, [theme])

	return <>{children}</>
}
