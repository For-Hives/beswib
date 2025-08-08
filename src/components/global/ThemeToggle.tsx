'use client'

import { useThemeStore } from '@/hooks/useTheme'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <button aria-label="Toggle theme" onClick={toggleTheme} className="rounded-md p-2">
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  )
}
