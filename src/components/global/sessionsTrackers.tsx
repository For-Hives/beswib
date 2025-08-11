'use client'

import { umamiIdentify } from '@/lib/umami.utils'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export function SessionsTracker() {
	const { user, isLoaded, isSignedIn } = useUser()

	useEffect(() => {
		if (isLoaded && isSignedIn && user) {
			umamiIdentify(user.id, { name: user.fullName, email: user.emailAddresses[0].toString() })
		}
	}, [isLoaded, isSignedIn, user])

	return null // This component does not render anything
}
