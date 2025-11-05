'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

import { umamiIdentify } from '@/lib/utils/umami'

export function SessionsTracker() {
	const { user, isSignedIn, isLoaded } = useUser()

	useEffect(() => {
		if (isLoaded === true && isSignedIn === true && user != null) {
			void umamiIdentify(user.id, { name: user.fullName, email: user.emailAddresses[0].toString() })
		}
	}, [isLoaded, isSignedIn, user])

	return null // This component does not render anything
}
