'use client'

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export default function CustomSignIn() {
	const { isLoaded, signIn, setActive } = useSignIn()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!isLoaded) return

		setIsLoading(true)
		setError('')

		try {
			const result = await signIn.create({
				identifier: email,
				password,
			})

			if (result.status === 'complete') {
				await setActive({ session: result.createdSessionId })
				router.push('/dashboard')
			} else {
				setError("Quelque chose s'est mal passé. Veuillez réessayer.")
			}
		} catch (err: any) {
			setError(err.errors?.[0]?.message || 'Email ou mot de passe incorrect.')
		} finally {
			setIsLoading(false)
		}
	}

	// Handle OAuth sign in
	const signInWith = (strategy: 'oauth_google' | 'oauth_github') => {
		if (!signIn) return

		setIsLoading(true)
		signIn.authenticateWithRedirect({
			strategy,
			redirectUrl: '/sso-callback',
			redirectUrlComplete: '/dashboard',
		})
	}

	if (!isLoaded) {
		return (
			<div className="flex h-96 items-center justify-center">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
			</div>
		)
	}

	return (
		<div className="w-full max-w-md space-y-6">
			{/* Header */}
			<div className="space-y-2 text-center">
				<h1 className="text-foreground text-2xl font-bold tracking-tight">Bon retour !</h1>
				<p className="text-muted-foreground text-sm">Connectez-vous à votre compte pour continuer</p>
			</div>

			{/* OAuth Buttons */}
			<div className="space-y-3">
				<Button
					variant="outline"
					size="lg"
					className="w-full"
					onClick={() => signInWith('oauth_google')}
					disabled={isLoading}
				>
					<Icons.google className="mr-2 h-4 w-4" />
					Continuer avec Google
				</Button>
				<Button
					variant="outline"
					size="lg"
					className="w-full"
					onClick={() => signInWith('oauth_github')}
					disabled={isLoading}
				>
					<Icons.gitHub className="mr-2 h-4 w-4" />
					Continuer avec GitHub
				</Button>
			</div>

			{/* Divider */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="border-border/50 w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background text-muted-foreground px-2 tracking-wider">ou continuez avec</span>
				</div>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
						{error}
					</div>
				)}

				<div className="space-y-2">
					<label htmlFor="email" className="text-foreground text-sm font-medium">
						Adresse email
					</label>
					<Input
						id="email"
						type="email"
						placeholder="votre@email.com"
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
						disabled={isLoading}
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="password" className="text-foreground text-sm font-medium">
						Mot de passe
					</label>
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
						disabled={isLoading}
					/>
				</div>

				<div className="flex items-center justify-end">
					<Link
						href="/forgot-password"
						className="text-primary hover:text-primary/80 text-sm transition-colors hover:underline"
					>
						Mot de passe oublié ?
					</Link>
				</div>

				<Button type="submit" size="lg" className="w-full" disabled={isLoading}>
					{isLoading ? (
						<>
							<div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
							Connexion...
						</>
					) : (
						'Se connecter'
					)}
				</Button>
			</form>

			{/* Footer */}
			<div className="text-center">
				<p className="text-muted-foreground text-sm">
					Pas encore de compte ?{' '}
					<Link
						href="/sign-up"
						className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
					>
						Créer un compte
					</Link>
				</p>
			</div>
		</div>
	)
}
