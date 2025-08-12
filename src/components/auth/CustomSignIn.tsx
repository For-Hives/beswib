'use client'

import { useEffect } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { FormInput } from '@/components/ui/FormInput'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useAuthStore } from '@/stores/authStore'
import { validateEmail, validatePassword } from '@/lib/validation'

export default function CustomSignIn() {
	const { isLoaded, signIn, setActive } = useSignIn()
	const router = useRouter()

	const {
		signInData,
		isSigningIn,
		globalError,
		fieldErrors,
		setSignInData,
		setSigningIn,
		setGlobalError,
		setFieldError,
		clearFieldError,
		resetSignInForm,
	} = useAuthStore()

	// Reset form on component mount
	useEffect(() => {
		resetSignInForm()
	}, [resetSignInForm])

	// Validate fields in real-time
	const validateField = (field: 'email' | 'password', value: string) => {
		let error = null

		switch (field) {
			case 'email':
				error = validateEmail(value)
				break
			case 'password':
				error = validatePassword(value, false)
				break
		}

		setFieldError(field, error)
		return error === null
	}

	// Handle input changes
	const handleInputChange = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setSignInData({ [field]: value })

		// Clear field error on input change
		if (fieldErrors[field]) {
			clearFieldError(field)
		}

		// Clear global error
		if (globalError) {
			setGlobalError('')
		}
	}

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!isLoaded || isSigningIn) return

		// Validate all fields
		const emailValid = validateField('email', signInData.email)
		const passwordValid = validateField('password', signInData.password)

		if (!emailValid || !passwordValid) {
			return
		}

		setSigningIn(true)
		setGlobalError('')

		try {
			const result = await signIn.create({
				identifier: signInData.email,
				password: signInData.password,
			})

			if (result.status === 'complete') {
				await setActive({ session: result.createdSessionId })
				router.push('/dashboard')
			} else {
				setGlobalError("Quelque chose s'est mal passé. Veuillez réessayer.")
			}
		} catch (err: any) {
			const errorMessage = err.errors?.[0]?.message || 'Email ou mot de passe incorrect.'
			setGlobalError(errorMessage)

			// Set specific field errors based on error codes
			if (err.errors?.[0]?.code === 'form_identifier_not_found') {
				setFieldError('email', { message: 'Aucun compte trouvé avec cette adresse email', code: 'not_found' })
			} else if (err.errors?.[0]?.code === 'form_password_incorrect') {
				setFieldError('password', { message: 'Mot de passe incorrect', code: 'incorrect' })
			}
		} finally {
			setSigningIn(false)
		}
	}

	// Handle OAuth sign in
	const signInWith = (strategy: 'oauth_google' | 'oauth_facebook') => {
		if (!signIn) return

		setSigningIn(true)
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
					disabled={isSigningIn}
				>
					<Icons.google className="mr-2 h-4 w-4" />
					Continuer avec Google
				</Button>
				<Button
					variant="outline"
					size="lg"
					className="w-full"
					onClick={() => signInWith('oauth_facebook')}
					disabled={isSigningIn}
				>
					<Icons.facebook className="mr-2 h-4 w-4" />
					Continuer avec Facebook
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
				{globalError && (
					<div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
						<span className="text-destructive">⚠</span>
						{globalError}
					</div>
				)}

				<FormInput
					type="email"
					label="Adresse email"
					placeholder="votre@email.com"
					value={signInData.email}
					onChange={handleInputChange('email')}
					error={fieldErrors.email}
					disabled={isSigningIn}
					autoComplete="email"
				/>

				<FormInput
					type="password"
					label="Mot de passe"
					placeholder="••••••••"
					value={signInData.password}
					onChange={handleInputChange('password')}
					error={fieldErrors.password}
					disabled={isSigningIn}
					showPasswordToggle
					autoComplete="current-password"
				/>

				<div className="flex items-center justify-end">
					<Link
						href="/forgot-password"
						className="text-primary hover:text-primary/80 text-sm transition-colors hover:underline"
					>
						Mot de passe oublié ?
					</Link>
				</div>

				<Button type="submit" size="lg" className="w-full" disabled={isSigningIn}>
					{isSigningIn ? (
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
