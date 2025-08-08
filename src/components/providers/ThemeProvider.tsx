'use client'

import { useThemeStore } from '@/hooks/useTheme'
import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { theme, setTheme } = useThemeStore()

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
