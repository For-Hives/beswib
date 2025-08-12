'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'

interface UseAuthRedirectOptions {
	redirectTo?: string
	condition: 'signed-in' | 'signed-out'
}

/**
 * Hook pour gérer les redirections basées sur l'état d'authentification
 *
 * @param condition - 'signed-in' pour rediriger si connecté, 'signed-out' pour rediriger si non connecté
 * @param redirectTo - URL de redirection personnalisée (optionnel)
 *
 * @example
 * // Dans une page qui ne doit être accessible qu'aux utilisateurs non connectés
 * useAuthRedirect({ condition: 'signed-in', redirectTo: '/dashboard' })
 *
 * // Dans une page qui nécessite une authentification
 * useAuthRedirect({ condition: 'signed-out', redirectTo: '/sign-in' })
 */
export function useAuthRedirect({ condition, redirectTo }: UseAuthRedirectOptions) {
	const { isSignedIn, isLoaded } = useAuth()
	const router = useRouter()
	const params = useParams()
	const locale = params?.locale || 'fr'

	useEffect(() => {
		if (!isLoaded) return // Attendre que Clerk soit chargé

		const shouldRedirect = (condition === 'signed-in' && isSignedIn) || (condition === 'signed-out' && !isSignedIn)

		if (shouldRedirect) {
			const defaultRedirects = {
				'signed-in': `/${locale}/dashboard`,
				'signed-out': `/${locale}/sign-in`,
			}

			const targetUrl = redirectTo || defaultRedirects[condition]
			router.replace(targetUrl)
		}
	}, [isSignedIn, isLoaded, router, redirectTo, condition, locale])

	return {
		isLoaded,
		isSignedIn,
		shouldRedirect:
			isLoaded && ((condition === 'signed-in' && isSignedIn) || (condition === 'signed-out' && !isSignedIn)),
	}
}
