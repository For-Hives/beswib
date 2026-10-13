'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useThemeStore } from '@/hooks/useTheme'
import { umamiAttrs } from '@/lib/analytics/attrs'

export function ThemeToggle() {
	const { toggleTheme, theme } = useThemeStore()
	const [isHydrated, setIsHydrated] = useState(false)

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	if (!isHydrated) {
		// Return a placeholder during SSR to avoid hydration mismatch
		return (
			<button type="button" aria-label="Toggle theme" className="pointer-events-auto cursor-pointer rounded-md p-2">
				<Sun />
			</button>
		)
	}

	return (
		<button
			type="button"
			aria-label="Toggle theme"
			onClick={toggleTheme}
			className="pointer-events-auto cursor-pointer rounded-md p-2"
			{...umamiAttrs('theme_change', { to: theme === 'light' ? 'dark' : 'light' })}
		>
			{theme === 'light' ? <Moon /> : <Sun />}
		</button>
	)
}
