'use client'

import { UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { toast } from 'sonner'
import {
	BibDetailsStep,
	ConfirmationStep,
	EmailVerificationStep,
	EventSelectionStep,
	PricingStep,
	ProgressSteps,
	StepNavigation,
} from '@/components/admin/dashboard/sell-bib'
import SellerProfileValidation from '@/components/dashboard/seller/SellerProfileValidation'
import { Separator } from '@/components/ui/separator'
import { countBucket, priceBucket } from '@/lib/analytics/buckets'
import type { EventProps } from '@/lib/analytics/catalog'
import { verifiedEmailKind, wizardStep } from '@/lib/analytics/classify'
import { track, trackView } from '@/lib/analytics/client'
import { eventIdOf } from '@/lib/analytics/ids'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { isSellerProfileComplete } from '@/lib/validation/user'
import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import type { Organizer } from '@/models/organizer.model'
import type { User } from '@/models/user.model'
import type { VerifiedEmail } from '@/models/verifiedEmail.model'
import { createBib } from '@/services/bib.services'
import {
	createVerifiedEmail,
	fetchVerifiedEmailsByUserId,
	resendVerificationCode,
	verifyEmail,
} from '@/services/verifiedEmail.services'

interface FormData {
	acceptedTerms: boolean
	linkedEmailId?: string
	listingType: 'private' | 'public'
	optionValues: Record<string, string>
	originalPrice: string
	registrationNumber: string
	selectedEvent: (Event & { expand?: { organizer?: Organizer } }) | null
	sellingPrice: string
}

interface SellBibClientProps {
	availableEvents: (Event & { expand?: { organizer?: Organizer } })[]
	locale: Locale
	user: User
}

const STEPS = ['eventSelection', 'emailVerification', 'bibDetails', 'pricing', 'confirmation'] as const
type Step = (typeof STEPS)[number]

// Each step validates a single field
const VALIDATION_FIELDS: Record<Step, EventProps<'listing_error'>['field']> = {
	pricing: 'price',
	eventSelection: 'event',
	emailVerification: 'email',
	confirmation: 'terms',
	bibDetails: 'registration_number',
}

import sellBibTranslations from '@/app/[locale]/dashboard/seller/sell-bib/locales.json'

export default function SellBibClient({ user, locale, availableEvents }: SellBibClientProps) {
	const t = getTranslations(locale, sellBibTranslations)

	const [currentStep, setCurrentStep] = useState<Step>('eventSelection')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [createdBib, setCreatedBib] = useState<Bib | null>(null)
	const [verifiedEmails, setVerifiedEmails] = useState<VerifiedEmail[]>([])

	// Check if seller profile is complete
	const isSellerProfileValid = isSellerProfileComplete(user)

	const [formData, setFormData] = useState<FormData>({
		sellingPrice: '',
		selectedEvent: null,
		registrationNumber: '',
		originalPrice: '',
		optionValues: {},
		listingType: 'public',
		linkedEmailId: undefined,
		acceptedTerms: false,
	})

	const currentStepIndex = STEPS.indexOf(currentStep)
	const isFirstStep = currentStepIndex === 0
	const isLastStep = currentStepIndex === STEPS.length - 1

	// Load verified emails on component mount
	useEffect(() => {
		const loadVerifiedEmails = async () => {
			try {
				const result = await fetchVerifiedEmailsByUserId(user.id)
				if (result.success && result.data) {
					setVerifiedEmails(result.data)

					// Auto-select the user's main email if it exists as verified
					const mainEmailVerified = result.data.find(email => email.email === user.email)
					if (mainEmailVerified !== undefined && formData.linkedEmailId === undefined) {
						setFormData(prev => ({ ...prev, linkedEmailId: mainEmailVerified.id }))
					} else if (formData.linkedEmailId === undefined) {
						// Default to 'main-email' (user's account email)
						setFormData(prev => ({ ...prev, linkedEmailId: 'main-email' }))
					}
				} else {
					console.error('Error loading verified emails:', result.error)
				}
			} catch (error) {
				console.error('Error loading verified emails:', error)
			}
		}

		void loadVerifiedEmails()
	}, [user.id])

	useEffect(() => {
		trackView('listing_start', {
			profile_complete: isSellerProfileValid,
			events: countBucket(availableEvents.length),
		})
	}, [])

	// Handler for adding a new email
	const handleAddEmail = (email: string) => {
		void createVerifiedEmail({ userId: user.id, email })
			.then(result => {
				if (result.success && result.data) {
					setVerifiedEmails(prev => [...prev, result.data!])
					toast.success(t.messages.emailVerificationSent)
					track('verified_email_step', { where: 'sell_wizard', step: 'code_sent' })
				} else {
					track('verified_email_error', {
						where: 'sell_wizard',
						step: 'add',
						kind: verifiedEmailKind(result.error),
					})
					const errorMessage = result.error ?? t.messages.emailAddFailed
					setErrors({ emailVerification: errorMessage })
					toast.error(errorMessage)
				}
			})
			.catch(error => {
				console.error('Error adding email:', error)
				track('verified_email_error', { where: 'sell_wizard', step: 'add', kind: 'unknown' })
				const errorMessage = t.messages.emailAddFailed
				setErrors({ emailVerification: errorMessage })
				toast.error(errorMessage)
			})
	}

	// Handler for verifying an email
	const handleVerifyEmail = (emailId: string, code: string) => {
		void verifyEmail({ verifiedEmailId: emailId, verificationCode: code })
			.then(result => {
				if (result.success && result.data) {
					setVerifiedEmails(prev => prev.map(email => (email.id === emailId ? result.data! : email)))
					setErrors({})
					toast.success(t.messages.emailVerified)
					track('verified_email_success', { where: 'sell_wizard' })
				} else {
					track('verified_email_error', {
						where: 'sell_wizard',
						step: 'verify',
						kind: verifiedEmailKind(result.error),
					})
					const errorMessage = result.error ?? t.messages.invalidVerificationCode
					setErrors({ emailVerification: errorMessage })
					toast.error(errorMessage)
				}
			})
			.catch(error => {
				console.error('Error verifying email:', error)
				track('verified_email_error', { where: 'sell_wizard', step: 'verify', kind: 'unknown' })
				const errorMessage = t.messages.emailVerifyFailed
				setErrors({ emailVerification: errorMessage })
				toast.error(errorMessage)
			})
	}

	// Handler for resending verification code
	const handleResendCode = (emailId: string) => {
		void resendVerificationCode(emailId)
			.then(result => {
				if (result.success) {
					setErrors({})
					toast.success(t.messages.verificationCodeResent)
					track('verified_email_step', { where: 'sell_wizard', step: 'code_resent' })
				} else {
					track('verified_email_error', {
						where: 'sell_wizard',
						step: 'resend',
						kind: verifiedEmailKind(result.error),
					})
					const errorMessage = result.error ?? t.messages.emailResendFailed
					setErrors({ emailVerification: errorMessage })
					toast.error(errorMessage)
				}
			})
			.catch(error => {
				console.error('Error resending code:', error)
				track('verified_email_error', { where: 'sell_wizard', step: 'resend', kind: 'unknown' })
				const errorMessage = t.messages.emailResendFailed
				setErrors({ emailVerification: errorMessage })
				toast.error(errorMessage)
			})
	}

	const validateStep = (step: Step): boolean => {
		const newErrors: Record<string, string> = {}

		switch (step) {
			case 'bibDetails':
				if (!formData.registrationNumber.trim()) {
					newErrors.registrationNumber = t.validation.registrationNumberRequired
				}
				break

			case 'confirmation':
				if (!formData.acceptedTerms) {
					newErrors.acceptedTerms = t.form.confirmation.termsRequired
				}
				break

			case 'emailVerification':
				if (formData.linkedEmailId === undefined || formData.linkedEmailId == null || formData.linkedEmailId === '') {
					newErrors.linkedEmailId = t.form.emailVerification.selectEmailError
				} else if (formData.linkedEmailId !== 'main-email') {
					// Check if the selected email is verified
					const selectedEmail = verifiedEmails.find(email => email.id === formData.linkedEmailId)
					if (selectedEmail?.isVerified !== true) {
						newErrors.linkedEmailId = t.form.emailVerification.verifyEmailError
					}
				}
				break

			case 'eventSelection':
				if (formData.selectedEvent == null || formData.selectedEvent === undefined) {
					newErrors.selectedEvent = t.validation.eventRequired
				}
				break

			case 'pricing':
				if (formData.sellingPrice.trim() === '') {
					newErrors.sellingPrice = t.validation.priceRequired
				} else {
					const price = parseFloat(formData.sellingPrice)
					if (Number.isNaN(price) || price <= 0) {
						newErrors.sellingPrice = t.validation.priceMinimum
					}
				}
				break
		}

		if (Object.keys(newErrors).length > 0) {
			track('listing_error', { step: wizardStep(step), kind: 'validation', field: VALIDATION_FIELDS[step] })
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleNext = () => {
		if (validateStep(currentStep)) {
			// Check if seller profile is complete before allowing progression
			if (!isSellerProfileValid) {
				setErrors({ submit: 'Please complete your seller profile before proceeding.' })
				track('listing_error', { step: wizardStep(currentStep), kind: 'profile_incomplete', field: 'none' })
				return
			}

			if (!isLastStep) {
				setCurrentStep(STEPS[currentStepIndex + 1])
				track('listing_step', { step: wizardStep(STEPS[currentStepIndex + 1]), direction: 'next' })
			}
		}
	}

	const handlePrevious = () => {
		if (!isFirstStep) {
			setCurrentStep(STEPS[currentStepIndex - 1])
			track('listing_step', { step: wizardStep(STEPS[currentStepIndex - 1]), direction: 'back' })
		}
	}

	const handleSubmit = async () => {
		if (!validateStep(currentStep) || !formData.selectedEvent) {
			return
		}

		// Check if seller profile is complete before allowing submission
		if (!isSellerProfileValid) {
			setErrors({ submit: 'Please complete your seller profile before selling bibs.' })
			track('listing_error', { step: 'confirmation', kind: 'profile_incomplete', field: 'none' })
			return
		}

		const sellingPrice = parseFloat(formData.sellingPrice)
		const originalPrice = parseFloat(formData.originalPrice)
		let priceVsOriginal: EventProps<'listing_submit'>['price_vs_original'] = 'unknown'
		if (formData.originalPrice && !Number.isNaN(originalPrice) && !Number.isNaN(sellingPrice)) {
			if (sellingPrice < originalPrice) priceVsOriginal = 'below'
			else if (sellingPrice > originalPrice) priceVsOriginal = 'above'
			else priceVsOriginal = 'equal'
		}
		const usesAccountEmail =
			formData.linkedEmailId === 'main-email' ||
			verifiedEmails.some(email => email.id === formData.linkedEmailId && email.email === user.email)
		const listingProps: EventProps<'listing_submit'> = {
			price_vs_original: priceVsOriginal,
			price_bucket: priceBucket(sellingPrice),
			listing: formData.listingType,
			event_id: eventIdOf(formData.selectedEvent),
			email_source: usesAccountEmail ? 'account' : 'other',
		}
		track('listing_submit', listingProps)

		setIsSubmitting(true)

		try {
			// Determine the actual linkedEmailId to use
			let linkedEmailId: string | undefined
			if (
				formData.linkedEmailId !== undefined &&
				formData.linkedEmailId != null &&
				formData.linkedEmailId !== 'main-email'
			) {
				linkedEmailId = formData.linkedEmailId
			}

			const bibData: Omit<Bib, 'id'> = {
				validated: false,
				status: 'available',
				sellerUserId: user.id,
				registrationNumber: formData.registrationNumber,
				price: parseFloat(formData.sellingPrice),
				originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
				optionValues: formData.optionValues,
				listed: formData.listingType === 'public' ? 'public' : 'private',
				linkedEmailId,
				eventId: formData.selectedEvent.id,
			}

			const result = await createBib(bibData)

			if (result) {
				setCreatedBib(result)
				track('listing_success', listingProps)
			} else {
				setErrors({ submit: t.messages.error })
				track('listing_error', { step: 'confirmation', kind: 'create_rejected', field: 'none' })
			}
		} catch (error: unknown) {
			console.error('Error creating bib:', error)
			track('listing_error', { step: 'confirmation', kind: 'create_failed', field: 'none' })
			setErrors({ submit: t.messages.error })
		} finally {
			setIsSubmitting(false)
		}
	}

	const updateFormData = (data: Partial<FormData>) => {
		setFormData(prev => ({ ...prev, ...data }))
	}

	const renderStepContent = () => {
		switch (currentStep) {
			case 'bibDetails':
				// step 3
				return <BibDetailsStep errors={errors} formData={formData} locale={locale} onChange={updateFormData} />

			case 'confirmation':
				// step 5
				return (
					<ConfirmationStep
						createdBib={createdBib}
						errors={errors}
						formData={formData}
						locale={locale}
						onChange={updateFormData}
						user={user}
					/>
				)

			case 'emailVerification':
				// step 2
				return (
					<EmailVerificationStep
						user={user}
						locale={locale}
						verifiedEmails={verifiedEmails}
						selectedEmailId={formData.linkedEmailId}
						onEmailSelect={(emailId: string) => updateFormData({ linkedEmailId: emailId })}
						onAddEmail={handleAddEmail}
						onVerifyEmail={handleVerifyEmail}
						onResendCode={handleResendCode}
						error={errors.linkedEmailId || errors.emailVerification}
					/>
				)

			case 'eventSelection':
				// step 1
				return (
					<EventSelectionStep
						availableEvents={availableEvents}
						error={errors.selectedEvent}
						locale={locale}
						onEventSelect={(event: Event & { expand?: { organizer?: Organizer } }) =>
							updateFormData({ selectedEvent: event })
						}
						selectedEvent={formData.selectedEvent}
					/>
				)

			case 'pricing':
				// step 4
				return <PricingStep errors={errors} formData={formData} locale={locale} onChange={updateFormData} />
		}
	}

	// Loading state
	if (isSubmitting) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl">⏳</div>
						<h1 className="text-foreground mb-4 text-2xl font-bold">{t.messages.loading}</h1>
						<div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
							<div className="bg-primary h-full w-1/3 animate-pulse rounded-full"></div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

			{/* User header */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">{t.common.sellingAs}</p>
						<div className="text-foreground flex-col items-start justify-start gap-2 font-medium md:flex md:flex-row md:items-center">
							<div className="flex items-center gap-2">
								<p>
									<UserIcon className="h-4 w-4" />
								</p>
								<p>
									{user.firstName} {user.lastName}
								</p>
							</div>
							<p>{user.email && <span className="text-muted-foreground text-sm">({user.email})</span>}</p>
						</div>
					</div>
					<div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
						{t.common.sellerBadge}
					</div>
				</div>
			</div>

			<div className="relative pt-32">
				<div className="flex items-center justify-center p-6 md:p-10">
					<div className="dark:border-border/50 bg-card/80 relative w-full max-w-7xl rounded-3xl border border-black/50 p-8 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md md:p-12">
						{/* Header */}
						<div className="mb-12 text-left">
							<h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">{t.title}</h1>
							<p className="text-muted-foreground mt-4 text-lg">{t.subtitle}</p>
						</div>

						{/* Seller Profile Validation */}
						{!isSellerProfileValid && (
							<div className="mb-8">
								<SellerProfileValidation user={user} locale={locale} where="sell_wizard" />
							</div>
						)}

						{/* Progress Steps */}
						<ProgressSteps currentStepIndex={currentStepIndex} locale={locale} steps={STEPS} />

						{/* Step Content */}
						<div className="mb-16">{renderStepContent()}</div>

						<Separator className="my-12" />

						{/* Navigation */}
						<StepNavigation
							createdBib={!!createdBib}
							isFirstStep={isFirstStep}
							isLastStep={isLastStep}
							isSubmitting={isSubmitting}
							locale={locale}
							onNext={handleNext}
							onPrevious={handlePrevious}
							onSubmit={handleSubmit}
							trackStep={wizardStep(currentStep)}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
