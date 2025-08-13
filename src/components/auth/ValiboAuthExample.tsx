'use client'

import { useState } from 'react'

import { useValibot } from '@/hooks/useValibot'
import { useParams } from 'next/navigation'

import { createSignInSchema, createSignUpSchema } from '@/lib/validation-schemas'
import { authTranslations } from '@/lib/translations/auth'
import { FormInput } from '@/components/ui/FormInput'
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n-config'

interface ValiboAuthExampleProps {
	mode: 'signin' | 'signup'
}

export default function ValiboAuthExample({ mode }: ValiboAuthExampleProps) {
	const params = useParams()
	const locale = (params?.locale as Locale) || 'fr'
	const t = authTranslations[locale]

	// Use the appropriate schema based on mode
	const schema = mode === 'signin' ? createSignInSchema(locale) : createSignUpSchema(locale)

	// Initialize form data
	const [formData, setFormData] = useState(
		mode === 'signin'
			? { password: '', email: '' }
			: { password: '', lastName: '', firstName: '', email: '', confirmPassword: '' }
	)

	// Use the Valibot hook
	const { validateField, validate, errors, clearError } = useValibot(schema)

	// Handle input changes with real-time validation
	const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setFormData(prev => ({ ...prev, [field]: value }))

		// Clear error when user starts typing
		if (errors[field]) {
			clearError(field)
		}

		// Validate field on blur (you could also validate on change)
		if (value) {
			validateField(field, value)
		}
	}

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (validate(formData)) {
			console.log('Form is valid!', formData)
			// Proceed with authentication logic here
		} else {
			console.log('Form has errors:', errors)
		}
	}

	if (mode === 'signin') {
		return (
			<form onSubmit={handleSubmit} className="space-y-4">
				<h2 className="text-xl font-bold">{t.signIn.welcome}</h2>

				<FormInput
					type="email"
					label={t.fields.email}
					placeholder={t.placeholders.email}
					value={formData.email}
					onChange={handleInputChange('email')}
					error={errors.email}
					autoComplete="email"
				/>

				<FormInput
					type="password"
					label={t.fields.password}
					placeholder={t.placeholders.password}
					value={formData.password}
					onChange={handleInputChange('password')}
					error={errors.password}
					showPasswordToggle
					autoComplete="current-password"
				/>

				<Button type="submit" className="w-full">
					{t.signIn.signIn}
				</Button>
			</form>
		)
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<h2 className="text-xl font-bold">{t.signUp.title}</h2>

			<div className="grid grid-cols-2 gap-4">
				<FormInput
					type="text"
					label={t.signUp.firstNameLabel}
					placeholder={t.signUp.firstNamePlaceholder}
					value={(formData as any).firstName}
					onChange={handleInputChange('firstName')}
					error={errors.firstName}
					autoComplete="given-name"
				/>

				<FormInput
					type="text"
					label={t.signUp.lastNameLabel}
					placeholder={t.signUp.lastNamePlaceholder}
					value={(formData as any).lastName}
					onChange={handleInputChange('lastName')}
					error={errors.lastName}
					autoComplete="family-name"
				/>
			</div>

			<FormInput
				type="email"
				label={t.signUp.emailLabel}
				placeholder={t.signUp.emailPlaceholder}
				value={formData.email}
				onChange={handleInputChange('email')}
				error={errors.email}
				autoComplete="email"
			/>

			<FormInput
				type="password"
				label={t.signUp.passwordLabel}
				placeholder={t.signUp.passwordPlaceholder}
				value={formData.password}
				onChange={handleInputChange('password')}
				error={errors.password}
				showPasswordToggle
				autoComplete="new-password"
			/>

			<FormInput
				type="password"
				label={t.signUp.confirmPasswordLabel}
				placeholder={t.signUp.confirmPasswordPlaceholder}
				value={(formData as any).confirmPassword}
				onChange={handleInputChange('confirmPassword')}
				error={errors.confirmPassword}
				showPasswordToggle
				autoComplete="new-password"
			/>

			<Button type="submit" className="w-full">
				{t.signUp.signUpButton}
			</Button>
		</form>
	)
}
