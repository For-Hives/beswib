'use client'

import { useMemo } from 'react'
import { useThemeStore } from './useTheme'
import { getClerkAppearance } from '@/lib/clerkTheme'

export function useClerkTheme() {
  const { theme } = useThemeStore()
  
  const appearance = useMemo(() => {
    return getClerkAppearance(theme)
  }, [theme])
  
  return {
    theme,
    appearance
  }
}