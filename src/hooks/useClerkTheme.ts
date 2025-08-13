'use client'

import { useMemo } from 'react'

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

function getClerkAppearance(theme: string): any {
	throw new Error('Function not implemented.')
}
