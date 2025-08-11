'use client'

import { Moon, Sun } from 'lucide-react'

import { useThemeStore } from '@/hooks/useTheme'

export function ThemeToggle() {
	const { toggleTheme, theme } = useThemeStore()
	return (
		<button aria-label="Toggle theme" onClick={toggleTheme} className="rounded-md p-2">
			{theme === 'light' ? <Moon /> : <Sun />}
		</button>
	)
}
