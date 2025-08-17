'use client'

import { useEffect, useState } from 'react'

import { useThemeStore } from '@/hooks/useTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { theme } = useThemeStore()
	const [isHydrated, setIsHydrated] = useState(false)

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	useEffect(() => {
		if (!isHydrated) return

		// Keep color-scheme in sync with theme to avoid flash
		if (typeof document !== 'undefined') {
			document.documentElement.style.colorScheme = theme
		}
	}, [theme, isHydrated])

	useEffect(() => {
		if (!isHydrated) return

		document.documentElement.classList.remove('light', 'dark')
		document.documentElement.classList.add(theme)
	}, [theme, isHydrated])

	return <>{children}</>
}
