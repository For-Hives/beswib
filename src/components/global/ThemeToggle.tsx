'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

import { useThemeStore } from '@/hooks/useTheme'

export function ThemeToggle() {
	const { toggleTheme, theme } = useThemeStore()
	const [isHydrated, setIsHydrated] = useState(false)

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	if (!isHydrated) {
		// Return a placeholder during SSR to avoid hydration mismatch
		return (
			<button aria-label="Toggle theme" className="pointer-events-auto cursor-pointer rounded-md p-2">
				<Sun />
			</button>
		)
	}

	return (
		<button
			aria-label="Toggle theme"
			onClick={toggleTheme}
			className="pointer-events-auto cursor-pointer rounded-md p-2"
		>
			{theme === 'light' ? <Moon /> : <Sun />}
		</button>
	)
}
