'use client'

import { useEffect } from 'react'

import { useThemeStore } from '@/hooks/useTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { theme } = useThemeStore()

	useEffect(() => {
		// Keep color-scheme in sync with theme to avoid flash
		if (typeof document !== 'undefined') {
			document.documentElement.style.colorScheme = theme
		}
	}, [theme])

	useEffect(() => {
		document.documentElement.classList.remove('light', 'dark')
		document.documentElement.classList.add(theme)
	}, [theme])

	return <>{children}</>
}
