'use client'

import AuthGuard from './AuthGuard'

interface ProtectedRouteProps {
	children: React.ReactNode
	redirectTo?: string
}

/**
 * Wrapper component pour les pages qui nécessitent une authentification
 * Exemple d'utilisation dans une page dashboard :
 *
 * export default function Dashboard() {
 *   return (
 *     <ProtectedRoute>
 *       <div>Contenu du dashboard</div>
 *     </ProtectedRoute>
 *   )
 * }
 */
export default function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
	return (
		<AuthGuard mode="auth-required" redirectTo={redirectTo}>
			{children}
		</AuthGuard>
	)
}
