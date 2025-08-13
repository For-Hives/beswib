'use client'

import { useMemo } from 'react'

import { getClerkAppearance } from '@/lib/clerkTheme'

import { useThemeStore } from './useTheme'

export function useClerkTheme() {
	const { theme } = useThemeStore()

	const appearance = useMemo(() => {
		return getClerkAppearance(theme)
	}, [theme])

	return {
		theme,
		appearance,
	}
}
