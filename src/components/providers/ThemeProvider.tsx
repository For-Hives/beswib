'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderContextType = {
	setTheme: (theme: Theme) => void
	theme: Theme
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined)

interface ThemeProviderProps {
	children: React.ReactNode
	defaultTheme?: Theme
	storageKey?: string
}

export function ThemeProvider({
	storageKey = 'beswib-ui-theme',
	defaultTheme = 'system',
	children,
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(defaultTheme)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		// Get the stored theme or use default
		const storedTheme = localStorage.getItem(storageKey) as null | Theme
		if (storedTheme) {
			setTheme(storedTheme)
		}
	}, [storageKey])

	useEffect(() => {
		if (!mounted) return

		const root = window.document.documentElement

		root.classList.remove('light', 'dark')

		if (theme === 'system') {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
			root.classList.add(systemTheme)
		} else {
			root.classList.add(theme)
		}
	}, [theme, mounted])

	useEffect(() => {
		if (!mounted) return

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

		const handleChange = () => {
			if (theme === 'system') {
				const root = window.document.documentElement
				root.classList.remove('light', 'dark')
				const systemTheme = mediaQuery.matches ? 'dark' : 'light'
				root.classList.add(systemTheme)
			}
		}

		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [theme, mounted])

	const value = {
		theme,
		setTheme: (theme: Theme) => {
			localStorage.setItem(storageKey, theme)
			setTheme(theme)
		},
	}

	if (!mounted) {
		return <>{children}</>
	}

	return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export function useTheme() {
	const context = useContext(ThemeProviderContext)

	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}

	return context
}
