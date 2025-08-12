'use client'

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export default function CustomSignUp() {
	const { isLoaded, signUp, setActive } = useSignUp()
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [verifying, setVerifying] = useState(false)
	const [code, setCode] = useState('')
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
			await signUp.create({
				firstName,
				lastName,
				emailAddress: email,
				password,
			})

			// Prepare email verification
			await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
			setVerifying(true)
		} catch (err: any) {
			setError(err.errors?.[0]?.message || "Une erreur s'est produite lors de la création du compte.")
		} finally {
			setIsLoading(false)
		}
	}

	// Handle verification
	const handleVerification = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!isLoaded) return

		setIsLoading(true)
		setError('')

		try {
			const completeSignUp = await signUp.attemptEmailAddressVerification({
				code,
			})

			if (completeSignUp.status === 'complete') {
				await setActive({ session: completeSignUp.createdSessionId })
				router.push('/dashboard')
			} else {
				setError("Quelque chose s'est mal passé. Veuillez réessayer.")
			}
		} catch (err: any) {
			setError(err.errors?.[0]?.message || 'Code de vérification incorrect.')
		} finally {
			setIsLoading(false)
		}
	}

	// Handle OAuth sign up
	const signUpWith = (strategy: 'oauth_google' | 'oauth_github') => {
		if (!signUp) return

		setIsLoading(true)
		signUp.authenticateWithRedirect({
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

	// Verification form
	if (verifying) {
		return (
			<div className="w-full max-w-md space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-foreground text-2xl font-bold tracking-tight">Vérifiez votre email</h1>
					<p className="text-muted-foreground text-sm">
						Nous avons envoyé un code de vérification à <strong>{email}</strong>
					</p>
				</div>

				<form onSubmit={handleVerification} className="space-y-4">
					{error && (
						<div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
							{error}
						</div>
					)}

					<div className="space-y-2">
						<label htmlFor="code" className="text-foreground text-sm font-medium">
							Code de vérification
						</label>
						<Input
							id="code"
							type="text"
							placeholder="123456"
							value={code}
							onChange={e => setCode(e.target.value)}
							required
							disabled={isLoading}
							className="text-center font-mono text-lg tracking-wider"
						/>
					</div>

					<Button type="submit" size="lg" className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
								Vérification...
							</>
						) : (
							'Vérifier'
						)}
					</Button>
				</form>

				<div className="text-center">
					<button
						onClick={() => {
							setVerifying(false)
							setCode('')
							setError('')
						}}
						className="text-muted-foreground hover:text-foreground text-sm transition-colors"
					>
						← Retour au formulaire
					</button>
				</div>
			</div>
		)
	}

	// Sign up form
	return (
		<div className="w-full max-w-md space-y-6">
			{/* Header */}
			<div className="space-y-2 text-center">
				<h1 className="text-foreground text-2xl font-bold tracking-tight">Créer un compte</h1>
				<p className="text-muted-foreground text-sm">
					Rejoignez la communauté Beswib et commencez à échanger vos dossards
				</p>
			</div>

			{/* OAuth Buttons */}
			<div className="space-y-3">
				<Button
					variant="outline"
					size="lg"
					className="w-full"
					onClick={() => signUpWith('oauth_google')}
					disabled={isLoading}
				>
					<Icons.google className="mr-2 h-4 w-4" />
					Continuer avec Google
				</Button>
				<Button
					variant="outline"
					size="lg"
					className="w-full"
					onClick={() => signUpWith('oauth_github')}
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
					<span className="bg-background text-muted-foreground px-2 tracking-wider">ou créez un compte avec</span>
				</div>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
						{error}
					</div>
				)}

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<label htmlFor="firstName" className="text-foreground text-sm font-medium">
							Prénom
						</label>
						<Input
							id="firstName"
							type="text"
							placeholder="Jean"
							value={firstName}
							onChange={e => setFirstName(e.target.value)}
							required
							disabled={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="lastName" className="text-foreground text-sm font-medium">
							Nom
						</label>
						<Input
							id="lastName"
							type="text"
							placeholder="Dupont"
							value={lastName}
							onChange={e => setLastName(e.target.value)}
							required
							disabled={isLoading}
						/>
					</div>
				</div>

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
					<p className="text-muted-foreground text-xs">Au moins 8 caractères avec une majuscule et un chiffre</p>
				</div>

				<Button type="submit" size="lg" className="w-full" disabled={isLoading}>
					{isLoading ? (
						<>
							<div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
							Création...
						</>
					) : (
						'Créer un compte'
					)}
				</Button>
			</form>

			{/* Footer */}
			<div className="text-center">
				<p className="text-muted-foreground text-sm">
					Déjà un compte ?{' '}
					<Link
						href="/sign-in"
						className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
					>
						Se connecter
					</Link>
				</p>
			</div>
		</div>
	)
}
