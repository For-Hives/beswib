'use client'

import { CheckCircle, User as UserIcon, Shield, MapPin, FileText, AlertTriangle, Save } from 'lucide-react'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { useState, useTransition, useEffect } from 'react'

import { valibotResolver } from '@hookform/resolvers/valibot'

import { SelectAnimated, type SelectOption } from '@/components/ui/select-animated'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchVerifiedEmailsByUserId } from '@/services/verifiedEmail.services'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InputWithValidation } from '@/components/ui/input-with-validation'
import profileTranslations from '@/components/profile/locales.json'
import { updateUserProfile } from '@/app/[locale]/profile/actions'
import { createRunnerFormSchema } from '@/lib/validation/schemas'
import { isUserProfileComplete } from '@/lib/validation/user'
import { AddressInput } from '@/components/ui/address-input'
import { VerifiedEmail } from '@/models/verifiedEmail.model'
import { formatDateForHTMLInput } from '@/lib/utils/date'
import { PhoneInput } from '@/components/ui/phone-input'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { User } from '@/models/user.model'
import { Locale } from '@/lib/i18n/config'

import VerifiedEmailsManager from './VerifiedEmailsManager'

type RunnerFormData = {
	firstName: string
	lastName: string
	birthDate: string // YYYY-MM-DD
	phoneNumber: string
	contactEmail?: string
	consentMarket?: boolean
	emergencyContactName: string
	emergencyContactPhone: string
	emergencyContactRelationship: string
	address: string
	postalCode: string
	city: string
	country: string
	gender?: 'male' | 'female' | 'other' // Now optional
	medicalCertificateUrl?: string
	clubAffiliation?: string
	licenseNumber?: string
}

export default function ModernRunnerForm({
	user,
	locale = 'en' as Locale,
	onUserUpdate
}: Readonly<{
	user: User;
	locale?: Locale;
	onUserUpdate?: (updatedUser: User) => void;
}>) {
	const t = getTranslations(locale, profileTranslations)
	const [isPending, startTransition] = useTransition()
	const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
	const [verifiedEmails, setVerifiedEmails] = useState<VerifiedEmail[]>([])

	// Local user state that gets updated when profile is saved
	const [localUser, setLocalUser] = useState<User>(user)

	// Update local user when prop changes (e.g., from parent component)
	useEffect(() => {
		setLocalUser(user)
	}, [user])

	// Load verified emails for contact email selector
	const loadVerifiedEmails = async () => {
		try {
			const result = await fetchVerifiedEmailsByUserId(user.id)
			if (result.success && result.data) {
				setVerifiedEmails(result.data)
			}
		} catch (error) {
			console.error('Failed to load verified emails:', error)
		}
	}

	useEffect(() => {
		void loadVerifiedEmails()
	}, [user.id])

	// Calculate completion status from local user state
	const isComplete = isUserProfileComplete(localUser)

	// Gender options for SelectAnimated
	const genderOptions: SelectOption[] = [
		{ value: 'male', label: t.genderOptions?.male ?? 'Male' },
		{ value: 'female', label: t.genderOptions?.female ?? 'Female' },
		{ value: 'other', label: t.genderOptions?.other ?? 'Other' },
	]

	// Contact email options for SelectAnimated
	const contactEmailOptions: SelectOption[] = [
		// Primary account email
		{ value: user.email, label: `${user.email} (${t.primaryAccount ?? 'Primary account email'})` },
		// Verified emails
		...verifiedEmails.map(email => ({
			value: email.email,
			label: email.email,
		})),
	]

	const form = useForm<RunnerFormData>({
		resolver: valibotResolver(createRunnerFormSchema(locale)),
		defaultValues: {
			postalCode: user?.postalCode ?? '',
			phoneNumber: user?.phoneNumber ?? '',
			medicalCertificateUrl: user?.medicalCertificateUrl ?? '',
			licenseNumber: user?.licenseNumber ?? '',
			lastName: user?.lastName ?? '',
			gender:
				user?.gender === 'male' || user?.gender === 'female' || user?.gender === 'other' ? user.gender : undefined,
			firstName: user?.firstName ?? '',
			emergencyContactRelationship: user?.emergencyContactRelationship ?? '',
			emergencyContactPhone: user?.emergencyContactPhone ?? '',
			emergencyContactName: user?.emergencyContactName ?? '',
			country: user?.country ?? '',
			contactEmail: user?.contactEmail ?? user?.email ?? '', // Use contactEmail first, fallback to email if contactEmail is empty
			consentMarket: user?.consentMarket ?? false,
			clubAffiliation: user?.clubAffiliation ?? '',
			city: user?.city ?? '',
			birthDate: formatDateForHTMLInput(user?.birthDate),
			address: user?.address ?? '',
		},
	})

	// Update form's contactEmail when user changes (after form is declared)
	useEffect(() => {
		form.setValue('contactEmail', user?.contactEmail ?? user?.email ?? '')
	}, [user?.contactEmail, user?.email, form])

	const onSubmit: SubmitHandler<RunnerFormData> = values => {
		if (user == null) return

		// Helper function to check if phone number is meaningful (not just country code)
		const isPhoneNumberValid = (phone: string) => {
			if (!phone || phone.trim() === '') return false
			// Consider phone number as empty if it's just a country code (e.g., "+33" or "+1")
			if (phone.match(/^\+\d{1,3}$/)) return false
			return true
		}

		// Clean up phone number: if it's just a country code, save as empty string
		const cleanPhoneNumber = isPhoneNumberValid(values.phoneNumber) ? values.phoneNumber : ''

		const payload: Partial<User> = {
			...values,
			phoneNumber: cleanPhoneNumber,
			birthDate: values.birthDate ? values.birthDate.slice(0, 10) : null,
		}
		console.info('Submitting profile update:', payload)
		startTransition(async () => {
			try {
				setSubmitStatus('idle')
				const updatedUser = await updateUserProfile(user.id, payload)

				// Update local user state with the updated user data
				setLocalUser(updatedUser)

				// Notify parent component about the user update for real-time completion status
				if (onUserUpdate) {
					onUserUpdate(updatedUser)
				}

				setSubmitStatus('success')
				setTimeout(() => setSubmitStatus('idle'), 3000)
			} catch (error) {
				console.error(error)
				setSubmitStatus('error')
				setTimeout(() => setSubmitStatus('idle'), 5000)
			}
		})
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		void form.handleSubmit(onSubmit)(e)
	}

	return (
		<div className="space-y-8">
			{/* Status Alert */}
			{!isComplete && (
				<Alert variant="destructive" className="bg-red-500/5">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>{t.profileRequiredTitle ?? 'Profile Required for Marketplace Access'}</AlertTitle>
					<AlertDescription>
						{t.profileRequiredDesc ??
							'Please complete all required fields below to access the marketplace and purchase bibs. Fields marked with * are required.'}
					</AlertDescription>
				</Alert>
			)}

			{isComplete && (
				<Alert className="border-green-500/50 bg-green-500/10">
					<CheckCircle className="h-4 w-4 text-green-500" />
					<AlertTitle className="text-green-700 dark:text-green-300">
						{t.profileCompleteTitle ?? 'Profile Complete'}
					</AlertTitle>
					<AlertDescription className="text-green-600 dark:text-green-400">
						{t.profileCompleteDesc ?? 'Your profile is complete! You can now access the marketplace and purchase bibs.'}
					</AlertDescription>
				</Alert>
			)}

			{/* Submit Status Messages */}
			{submitStatus === 'success' && (
				<Alert className="border-green-500/50 bg-green-500/10">
					<CheckCircle className="h-4 w-4 text-green-500" />
					<AlertTitle className="text-green-700 dark:text-green-300">
						{t.profileSavedTitle ?? 'Profile Saved'}
					</AlertTitle>
					<AlertDescription className="text-green-600 dark:text-green-400">
						{t.profileSavedDesc ?? 'Your profile has been successfully updated.'}
					</AlertDescription>
				</Alert>
			)}

			{submitStatus === 'error' && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>{t.errorSavingTitle ?? 'Error Saving Profile'}</AlertTitle>
					<AlertDescription>
						{t.errorSavingDesc ?? 'There was an error saving your profile. Please try again.'}
					</AlertDescription>
				</Alert>
			)}

			<VerifiedEmailsManager user={localUser} locale={locale} onEmailVerified={() => void loadVerifiedEmails()} />

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Personal Information Section */}
				<Card className="dark:border-border/50 bg-card/80 relative z-20 border-black/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserIcon className="text-primary h-5 w-5" />
							{t.personalInfo ?? 'Personal Information'}
						</CardTitle>
					</CardHeader>
					<CardContent className="z-auto grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="firstName">
								{t.firstName ?? 'First Name'}
							</Label>
							<Input
								{...form.register('firstName')}
								className={form.formState.errors.firstName ? 'border-red-500' : ''}
								id="firstName"
								placeholder={t.firstNamePlaceholder ?? 'Enter your first name'}
								type="text"
							/>
							{typeof form.formState.errors.firstName?.message === 'string' && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.firstName.message}</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="lastName">
								{t.lastName ?? 'Last Name'}
							</Label>
							<Input
								{...form.register('lastName')}
								className={form.formState.errors.lastName ? 'border-red-500' : ''}
								id="lastName"
								placeholder={t.lastNamePlaceholder ?? 'Enter your last name'}
								type="text"
							/>
							{typeof form.formState.errors.lastName?.message === 'string' && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.lastName.message}</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="birthDate">
								{t.birthDate ?? 'Birth Date'}
							</Label>
							<Controller
								name="birthDate"
								control={form.control}
								render={({ field }) => (
									<Input
										id="birthDate"
										type="date"
										className={form.formState.errors.birthDate?.message != null ? 'border-red-500' : ''}
										value={field.value ?? ''}
										onChange={e => field.onChange(e.target.value)}
									/>
								)}
							/>
							{typeof form.formState.errors.birthDate?.message === 'string' && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.birthDate.message}</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="gender">
								{t.gender ?? 'Gender'}
							</Label>
							<SelectAnimated
								onValueChange={value => form.setValue('gender', value as 'male' | 'female' | 'other')}
								options={genderOptions}
								placeholder="Select your gender"
								value={form.watch('gender')}
							/>
							{form.formState.errors.gender && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.gender.message}</p>
							)}
						</div>
						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="phoneNumber">
								{t.phoneNumber ?? 'Phone Number'}
							</Label>
							<Controller
								name="phoneNumber"
								control={form.control}
								render={({ field }) => (
									<PhoneInput
										value={field.value || ''}
										onChange={field.onChange}
										onBlur={field.onBlur}
										placeholder={t.phonePlaceholder ?? 'Enter your phone number'}
										defaultCountry="fr"
										error={!!form.formState.errors.phoneNumber}
									/>
								)}
							/>
							{form.formState.errors.phoneNumber && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">
									{form.formState.errors.phoneNumber.message}
								</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="contactEmail">
								{t.contactEmail ?? 'Contact Email'}
							</Label>
							<SelectAnimated
								onValueChange={value => form.setValue('contactEmail', value)}
								options={contactEmailOptions}
								placeholder={t.selectContactEmailPlaceholder ?? 'Select your contact email'}
								value={form.watch('contactEmail')}
							/>
							{form.formState.errors.contactEmail && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">
									{form.formState.errors.contactEmail.message ?? 'Invalid contact email'}
								</p>
							)}
						</div>

						<div className="sm:col-span-2">
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="consentMarket"
									{...form.register('consentMarket')}
									className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
								/>
								<Label htmlFor="consentMarket" className="text-muted-foreground text-sm">
									{t.consentMarket ?? 'I consent to receive marketing emails on my contact email address'}
								</Label>
							</div>
							<p className="text-muted-foreground mt-1 text-xs">
								{t.consentMarketHelp ?? 'This email may be used for commercial communications and promotional offers'}
							</p>
						</div>
					</CardContent>
					<div className="border-border/50 bg-muted/30 text-muted-foreground border-t px-6 py-3 text-xs">
						{t.contactEmailNote ??
							'Note: Your contact email may be used for commercial communications and promotional offers if you provide consent above.'}
					</div>
				</Card>

				{/* Emergency Contact Section */}
				<Card className="dark:border-border/50 bg-card/80 relative z-10 border-black/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="text-primary h-5 w-5" />
							{t.emergencySection ?? 'Emergency Contact'}
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="emergencyContactName">
								{t.contactName ?? 'Contact Name'}
							</Label>
							<Input
								{...form.register('emergencyContactName')}
								className={form.formState.errors.emergencyContactName ? 'border-red-500' : ''}
								id="emergencyContactName"
								placeholder="Emergency contact name"
								type="text"
							/>
							{form.formState.errors.emergencyContactName && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">
									{form.formState.errors.emergencyContactName.message}
								</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="emergencyContactPhone">
								{t.contactPhone ?? 'Contact Phone'}
							</Label>
							<Controller
								name="emergencyContactPhone"
								control={form.control}
								render={({ field }) => (
									<PhoneInput
										value={field.value || ''}
										onChange={field.onChange}
										onBlur={field.onBlur}
										placeholder={t.emergencyPhonePlaceholder ?? 'Enter emergency contact phone'}
										defaultCountry="fr"
										error={!!form.formState.errors.emergencyContactPhone}
									/>
								)}
							/>
							{form.formState.errors.emergencyContactPhone && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">
									{form.formState.errors.emergencyContactPhone.message}
								</p>
							)}
						</div>

						<div className="sm:col-span-2">
							<Label
								className="text-foreground mb-2 block text-base font-medium"
								htmlFor="emergencyContactRelationship"
							>
								{t.relationship ?? 'Relationship'}
							</Label>
							<Input
								{...form.register('emergencyContactRelationship')}
								className={form.formState.errors.emergencyContactRelationship ? 'border-red-500' : ''}
								id="emergencyContactRelationship"
								placeholder="e.g., Spouse, Parent, Friend"
								type="text"
							/>
							{form.formState.errors.emergencyContactRelationship && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">
									{form.formState.errors.emergencyContactRelationship.message}
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Address Section */}
				<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="text-primary h-5 w-5" />
							{t.addressSection ?? 'Address Information'}
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div className="sm:col-span-2">
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="address">
								{t.street ?? 'Street Address'}
							</Label>
							<AddressInput
								className={form.formState.errors.address ? 'border-red-500' : ''}
								id="address"
								placeholder="123 Main Street"
								value={form.watch('address')}
								onChange={value => form.setValue('address', value)}
								isCompleted={!!(form.watch('address')?.trim() && form.watch('address')?.trim().length >= 3)}
								hasError={!!form.formState.errors.address}
								otherFields={{
									postalCode: form.watch('postalCode'),
									country: form.watch('country'),
									city: form.watch('city'),
								}}
								onAddressSelect={components => {
									// Auto-fill ALL fields when user selects an address
									// Always fill street address (this is the main input)
									if (components.street && components.street.trim() !== '') {
										form.setValue('address', components.street)
									}

									// Smart fill: only update other fields if they're empty or significantly different
									const currentCity = form.getValues('city')?.trim() ?? ''
									const currentPostalCode = form.getValues('postalCode')?.trim() ?? ''
									const currentCountry = form.getValues('country')?.trim() ?? ''

									// Fill city if empty or if it's very different from the suggested one
									if (components.city && components.city.trim() !== '') {
										const suggestedCity = components.city.trim()
										if (!currentCity?.toLowerCase().includes(suggestedCity.toLowerCase())) {
											form.setValue('city', suggestedCity)
										}
									}

									// Fill postal code if empty or different
									if (components.postalCode && components.postalCode.trim() !== '') {
										if (!currentPostalCode || currentPostalCode !== components.postalCode.trim()) {
											form.setValue('postalCode', components.postalCode)
										}
									}

									// Fill country if empty or different
									if (components.country && components.country.trim() !== '') {
										if (!currentCountry || currentCountry !== components.country.trim()) {
											form.setValue('country', components.country)
										}
									}
								}}
							/>
							{form.formState.errors.address && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.address.message}</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="postalCode">
								{t.postalCode ?? 'Postal Code'}
							</Label>
							<InputWithValidation
								{...form.register('postalCode')}
								hasError={!!form.formState.errors.postalCode}
								isCompleted={!!(form.watch('postalCode')?.trim() && form.watch('postalCode')?.trim().length >= 3)}
								id="postalCode"
								placeholder="12345"
								type="text"
							/>
							{form.formState.errors.postalCode && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">
									{form.formState.errors.postalCode.message}
								</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="city">
								{t.city ?? 'City'}
							</Label>
							<InputWithValidation
								{...form.register('city')}
								hasError={!!form.formState.errors.city}
								isCompleted={!!(form.watch('city')?.trim() && form.watch('city')?.trim().length >= 2)}
								id="city"
								placeholder={t.cityPlaceholder ?? 'Enter your city'}
								type="text"
							/>
							{form.formState.errors.city && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.city.message}</p>
							)}
						</div>

						<div className="sm:col-span-2">
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="country">
								{t.country ?? 'Country'}
							</Label>
							<InputWithValidation
								{...form.register('country')}
								hasError={!!form.formState.errors.country}
								isCompleted={!!(form.watch('country')?.trim() && form.watch('country')?.trim().length >= 2)}
								id="country"
								placeholder={t.countryPlaceholder ?? 'Enter your country'}
								type="text"
							/>
							{form.formState.errors.country && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.country.message}</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Documents & Affiliations Section - Optional */}
				<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="text-primary h-5 w-5" />
							{t.documentsSection ?? 'Documents & Affiliations'}
							<span className="text-muted-foreground text-sm font-normal">{t.optional ?? '(Optional)'}</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-6">
						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="medicalCertificateUrl">
								{t.medicalCertUrl ?? 'Medical Certificate URL'}
							</Label>
							<Input
								{...form.register('medicalCertificateUrl')}
								id="medicalCertificateUrl"
								placeholder="https://example.com/medical-cert.pdf"
								type="url"
							/>
							<p className="text-muted-foreground mt-1 text-sm">
								{t.medicalCertHelp ?? 'Optional: Link to your medical certificate'}
							</p>
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="clubAffiliation">
								{t.clubAffiliation ?? 'Club Affiliation'}
							</Label>
							<Input
								{...form.register('clubAffiliation')}
								id="clubAffiliation"
								placeholder="Running Club Name"
								type="text"
							/>
							<p className="text-muted-foreground mt-1 text-sm">
								{t.clubAffiliationHelp ?? 'Optional: Name of your running/sports club'}
							</p>
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="licenseNumber">
								{t.licenseNumber ?? 'License Number'}
							</Label>
							<Input {...form.register('licenseNumber')} id="licenseNumber" placeholder="FFA123456" type="text" />
							<p className="text-muted-foreground mt-1 text-sm">
								{t.licenseNumberHelp ?? 'Optional: Your athletic federation license number'}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Submit Button */}
				<div className="flex justify-end">
					<Button
						className="flex items-center gap-2 px-8 py-3 text-lg font-medium"
						disabled={isPending}
						size="lg"
						type="submit"
					>
						<Save className="h-5 w-5" />
						{isPending ? (t.saving ?? 'Saving...') : (t.save ?? 'Save Profile')}
					</Button>
				</div>
			</form>
		</div>
	)
}
