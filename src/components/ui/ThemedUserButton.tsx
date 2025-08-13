'use client'

import { useClerkTheme } from '@/hooks/useClerkTheme'
import { UserButton } from '@clerk/nextjs'

export default function ThemedUserButton() {
	const { appearance } = useClerkTheme()

	return <UserButton appearance={appearance} showName={false} />
}
