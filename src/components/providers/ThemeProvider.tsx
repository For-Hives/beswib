'use client'

import { useThemeStore } from '@/hooks/useTheme'
import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { theme } = useThemeStore()

	useEffect(() => {
		document.documentElement.classList.remove('light', 'dark')
		document.documentElement.classList.add(theme)
	}, [theme])

	return <>{children}</>
}
