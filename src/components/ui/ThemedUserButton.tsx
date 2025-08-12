'use client'

import { UserButton } from '@clerk/nextjs'
import { useClerkTheme } from '@/hooks/useClerkTheme'

export default function ThemedUserButton() {
  const { appearance } = useClerkTheme()
  
  return (
    <UserButton 
      appearance={appearance}
      showName={false}
    />
  )
}