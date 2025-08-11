'use client'

import { useEffect } from 'react'

import { useUser } from '@clerk/nextjs'

import { umamiIdentify } from '@/lib/umami.utils'

export function SessionsTracker() {
	const { user, isSignedIn, isLoaded } = useUser()

	useEffect(() => {
		if (isLoaded && isSignedIn && user) {
			umamiIdentify(user.id, { name: user.fullName, email: user.emailAddresses[0].toString() })
		}
	}, [isLoaded, isSignedIn, user])

	return null // This component does not render anything
}
