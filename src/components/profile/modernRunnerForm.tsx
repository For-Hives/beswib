'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/inputAlt'
import { SelectAnimated, type SelectOption } from '@/components/ui/select-animated'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, User as UserIcon, Shield, MapPin, FileText, AlertTriangle, Save } from 'lucide-react'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { object, string, minLength, picklist, pipe, optional, email as emailValidator } from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { User } from '@/models/user.model'
import { updateUserProfile } from '@/app/[locale]/profile/actions'
import { isUserProfileComplete } from '@/lib/userValidation'
import { formatDateForHTMLInput } from '@/lib/dateUtils'

type RunnerFormData = {
	firstName: string
	lastName: string
	birthDate: string // YYYY-MM-DD
	phoneNumber: string
	contactEmail?: string
	emergencyContactName: string
	emergencyContactPhone: string
	emergencyContactRelationship: string
	address: string
	postalCode: string
	city: string
	country: string
	gender: 'male' | 'female' | 'other'
	medicalCertificateUrl?: string
	clubAffiliation?: string
	licenseNumber?: string
}

const runnerFormSchema = object({
	firstName: pipe(string(), minLength(2, 'First name must be at least 2 characters')),
	lastName: pipe(string(), minLength(2, 'Last name must be at least 2 characters')),
	birthDate: pipe(string(), minLength(10, 'Birth date is required')),
	phoneNumber: pipe(string(), minLength(0)),
	contactEmail: optional(pipe(string(), emailValidator('Invalid email address'))),
	emergencyContactName: pipe(string(), minLength(2, 'Contact name must be at least 2 characters')),
	emergencyContactPhone: pipe(string(), minLength(8, 'Invalid phone number')),
	emergencyContactRelationship: pipe(string(), minLength(2, 'Please specify the relationship')),
	address: pipe(string(), minLength(4, 'Address too short')),
	postalCode: pipe(string(), minLength(4, 'Invalid postal code')),
	city: pipe(string(), minLength(2, 'City name too short')),
	country: pipe(string(), minLength(2, 'Country name too short')),
	gender: picklist(['male', 'female', 'other'], 'Invalid gender'),
	medicalCertificateUrl: optional(string()),
	clubAffiliation: optional(string()),
	licenseNumber: optional(string()),
})

export default function ModernRunnerForm({ user }: Readonly<{ user: User }>) {
	const [isPending, startTransition] = useTransition()
	const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
	const isComplete = isUserProfileComplete(user)

	// Gender options for SelectAnimated
	const genderOptions: SelectOption[] = [
		{ value: 'male', label: 'Male' },
		{ value: 'female', label: 'Female' },
		{ value: 'other', label: 'Other' },
	]

	const form = useForm<RunnerFormData>({
		resolver: valibotResolver(runnerFormSchema),
		defaultValues: {
			firstName: user?.firstName ?? '',
			lastName: user?.lastName ?? '',
			birthDate: formatDateForHTMLInput(user?.birthDate),
			phoneNumber: user?.phoneNumber ?? '',
			contactEmail: user?.contactEmail ?? '',
			emergencyContactName: user?.emergencyContactName ?? '',
			emergencyContactPhone: user?.emergencyContactPhone ?? '',
			emergencyContactRelationship: user?.emergencyContactRelationship ?? '',
			address: user?.address ?? '',
			postalCode: user?.postalCode ?? '',
			city: user?.city ?? '',
			country: user?.country ?? '',
			gender: user?.gender === 'male' || user?.gender === 'female' || user?.gender === 'other' ? user.gender : 'male',
			medicalCertificateUrl: user?.medicalCertificateUrl ?? '',
			clubAffiliation: user?.clubAffiliation ?? '',
			licenseNumber: user?.licenseNumber ?? '',
		},
	})

	const onSubmit: SubmitHandler<RunnerFormData> = values => {
		if (user === null) return
		// Enforce at least one contact: if both are empty, surface client-side error
		const hasPhone = typeof values.phoneNumber === 'string' && values.phoneNumber.trim() !== ''
		const hasEmail = typeof values.contactEmail === 'string' && values.contactEmail.trim() !== ''
		if (!hasPhone && !hasEmail) {
			setSubmitStatus('error')
			return
		}
		const payload: Partial<User> = {
			...values,
			birthDate: values.birthDate ? values.birthDate.slice(0, 10) : null,
		}
		console.info('Submitting profile update:', payload)
		startTransition(async () => {
			try {
				setSubmitStatus('idle')
				await updateUserProfile(user.id, payload)
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
					<AlertTitle>Profile Required for Marketplace Access</AlertTitle>
					<AlertDescription>
						Please complete all required fields below to access the marketplace and purchase bibs. Fields marked with *
						are required.
					</AlertDescription>
				</Alert>
			)}

			{isComplete && (
				<Alert className="border-green-500/50 bg-green-500/10">
					<CheckCircle className="h-4 w-4 text-green-500" />
					<AlertTitle className="text-green-700 dark:text-green-300">Profile Complete</AlertTitle>
					<AlertDescription className="text-green-600 dark:text-green-400">
						Your profile is complete! You can now access the marketplace and purchase bibs.
					</AlertDescription>
				</Alert>
			)}

			{/* Submit Status Messages */}
			{submitStatus === 'success' && (
				<Alert className="border-green-500/50 bg-green-500/10">
					<CheckCircle className="h-4 w-4 text-green-500" />
					<AlertTitle className="text-green-700 dark:text-green-300">Profile Saved</AlertTitle>
					<AlertDescription className="text-green-600 dark:text-green-400">
						Your profile has been successfully updated.
					</AlertDescription>
				</Alert>
			)}

			{submitStatus === 'error' && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error Saving Profile</AlertTitle>
					<AlertDescription>There was an error saving your profile. Please try again.</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Personal Information Section */}
				<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserIcon className="text-primary h-5 w-5" />
							Personal Information
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="firstName">
								First Name *
							</Label>
							<Input
								{...form.register('firstName')}
								className={form.formState.errors.firstName ? 'border-red-500' : ''}
								id="firstName"
								placeholder="Enter your first name"
								type="text"
							/>
							{typeof form.formState.errors.firstName?.message === 'string' && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.firstName.message}</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="lastName">
								Last Name *
							</Label>
							<Input
								{...form.register('lastName')}
								className={form.formState.errors.lastName ? 'border-red-500' : ''}
								id="lastName"
								placeholder="Enter your last name"
								type="text"
							/>
							{typeof form.formState.errors.lastName?.message === 'string' && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.lastName.message}</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="birthDate">
								Birth Date *
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
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="phoneNumber">
								Phone Number
								<span className="text-muted-foreground ml-1 text-xs">(at least one of phone or contact email)</span>
							</Label>
							<Input
								{...form.register('phoneNumber')}
								className={form.formState.errors.phoneNumber ? 'border-red-500' : ''}
								id="phoneNumber"
								placeholder="+1 234 567 8900"
								type="tel"
							/>
							{form.formState.errors.phoneNumber && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">
									{form.formState.errors.phoneNumber.message}
								</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="contactEmail">
								Contact Email
								<span className="text-muted-foreground ml-1 text-xs">(optional alternative to phone)</span>
							</Label>
							<Input
								{...form.register('contactEmail')}
								className={form.formState.errors.contactEmail ? 'border-red-500' : ''}
								id="contactEmail"
								placeholder="you@example.com"
								type="email"
							/>
							{form.formState.errors.contactEmail && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">
									{form.formState.errors.contactEmail.message as string}
								</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="gender">
								Gender *
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
					</CardContent>
				</Card>

				{/* Emergency Contact Section */}
				<Card className="dark:border-border/50 bg-card/80 -z-10 border-black/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="text-primary h-5 w-5" />
							Emergency Contact
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="emergencyContactName">
								Contact Name *
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
								Contact Phone *
							</Label>
							<Input
								{...form.register('emergencyContactPhone')}
								className={form.formState.errors.emergencyContactPhone ? 'border-red-500' : ''}
								id="emergencyContactPhone"
								placeholder="+1 234 567 8900"
								type="tel"
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
								Relationship *
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
							Address Information
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div className="sm:col-span-2">
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="address">
								Street Address *
							</Label>
							<Input
								{...form.register('address')}
								className={form.formState.errors.address ? 'border-red-500' : ''}
								id="address"
								placeholder="123 Main Street"
								type="text"
							/>
							{form.formState.errors.address && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.address.message}</p>
							)}
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="postalCode">
								Postal Code *
							</Label>
							<Input
								{...form.register('postalCode')}
								className={form.formState.errors.postalCode ? 'border-red-500' : ''}
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
								City *
							</Label>
							<Input
								{...form.register('city')}
								className={form.formState.errors.city ? 'border-red-500' : ''}
								id="city"
								placeholder="Enter your city"
								type="text"
							/>
							{form.formState.errors.city && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.city.message}</p>
							)}
						</div>

						<div className="sm:col-span-2">
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="country">
								Country *
							</Label>
							<Input
								{...form.register('country')}
								className={form.formState.errors.country ? 'border-red-500' : ''}
								id="country"
								placeholder="Enter your country"
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
							Documents & Affiliations
							<span className="text-muted-foreground text-sm font-normal">(Optional)</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-6">
						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="medicalCertificateUrl">
								Medical Certificate URL
							</Label>
							<Input
								{...form.register('medicalCertificateUrl')}
								id="medicalCertificateUrl"
								placeholder="https://example.com/medical-cert.pdf"
								type="url"
							/>
							<p className="text-muted-foreground mt-1 text-sm">Optional: Link to your medical certificate</p>
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="clubAffiliation">
								Club Affiliation
							</Label>
							<Input
								{...form.register('clubAffiliation')}
								id="clubAffiliation"
								placeholder="Running Club Name"
								type="text"
							/>
							<p className="text-muted-foreground mt-1 text-sm">Optional: Name of your running/sports club</p>
						</div>

						<div>
							<Label className="text-foreground mb-2 block text-base font-medium" htmlFor="licenseNumber">
								License Number
							</Label>
							<Input {...form.register('licenseNumber')} id="licenseNumber" placeholder="FFA123456" type="text" />
							<p className="text-muted-foreground mt-1 text-sm">Optional: Your athletic federation license number</p>
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
						{isPending ? 'Saving...' : 'Save Profile'}
					</Button>
				</div>
			</form>
		</div>
	)
}
