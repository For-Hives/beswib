'use client'

import { useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

interface AuthGuardProps {
	children: React.ReactNode
	redirectTo?: string
	mode: 'guest-only' | 'auth-required'
}

/**
 * AuthGuard component pour gérer les redirections basées sur l'état d'authentification
 *
 * @param mode - 'guest-only' pour les pages d'auth (sign-in, sign-up, forgot-password)
 *               'auth-required' pour les pages protégées
 * @param redirectTo - URL de redirection personnalisée (optionnel)
 * @param children - Contenu à afficher si la condition est remplie
 */
export default function AuthGuard({ redirectTo, mode, children }: AuthGuardProps) {
	const { isSignedIn, isLoaded } = useAuth()
	const router = useRouter()
	const params = useParams()
	const locale = params?.locale || 'fr'

	useEffect(() => {
		if (!isLoaded) return // Attendre que Clerk soit chargé

		if (mode === 'guest-only' && isSignedIn) {
			// Utilisateur connecté essayant d'accéder aux pages d'auth
			const defaultRedirect = `/${locale}/dashboard`
			router.replace(redirectTo || defaultRedirect)
		} else if (mode === 'auth-required' && !isSignedIn) {
			// Utilisateur non connecté essayant d'accéder aux pages protégées
			const defaultRedirect = `/${locale}/sign-in`
			router.replace(redirectTo || defaultRedirect)
		}
	}, [isSignedIn, isLoaded, router, redirectTo, mode, locale])

	// Afficher un loader pendant le chargement
	if (!isLoaded) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="space-y-4 text-center">
					<div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
					<p className="text-muted-foreground text-sm">Chargement...</p>
				</div>
			</div>
		)
	}

	// Conditions pour afficher le contenu
	const shouldShowContent = (mode === 'guest-only' && !isSignedIn) || (mode === 'auth-required' && isSignedIn)

	if (!shouldShowContent) {
		// Ne pas afficher le contenu pendant la redirection
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="space-y-4 text-center">
					<div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
					<p className="text-muted-foreground text-sm">Redirection...</p>
				</div>
			</div>
		)
	}

	return <>{children}</>
}
