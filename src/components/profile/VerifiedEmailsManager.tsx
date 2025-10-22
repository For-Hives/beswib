'use client'

import { CheckIcon, MailIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/inputAlt'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { getTranslations } from '@/lib/i18n/dictionary'
import type { User } from '@/models/user.model'
import type { VerifiedEmail } from '@/models/verifiedEmail.model'
import {
	createVerifiedEmail,
	deleteVerifiedEmail,
	fetchVerifiedEmailsByUserId,
	resendVerificationCode,
	verifyEmail,
} from '@/services/verifiedEmail.services'

import pageLocales from './locales.json'

interface VerifiedEmailsManagerProps {
	user: User
	locale: string
	showContactEmailSelector?: boolean
	selectedContactEmailId?: string
	onContactEmailSelect?: (emailId: string) => void
	onEmailVerified?: () => void
}

export default function VerifiedEmailsManager({
	user,
	showContactEmailSelector = false,
	selectedContactEmailId,
	onEmailVerified,
	onContactEmailSelect,
	locale,
}: VerifiedEmailsManagerProps) {
	const t = getTranslations(locale, pageLocales)

	// Helper function to get translated error messages
	const getErrorMessage = (errorCode: string): string => {
		switch (errorCode) {
			case 'RATE_LIMIT_EXCEEDED':
				return t.verifiedEmails.errors.rateLimitExceeded ?? 'Please wait before requesting another verification code'
			case 'EMAIL_ALREADY_VERIFIED':
				return t.verifiedEmails.errors.emailAlreadyVerified ?? 'This email address is already verified for your account'
			case 'CREATE_EMAIL_FAILED':
				return t.verifiedEmails.errors.createEmailFailed ?? 'Failed to add email. Please try again.'
			case 'VERIFICATION_CODE_EXPIRED':
				return (
					t.verifiedEmails.errors.verificationCodeExpired ?? 'Verification code has expired. Please request a new one.'
				)
			case 'INVALID_VERIFICATION_CODE':
				return (
					t.verifiedEmails.errors.invalidVerificationCode ?? 'Invalid verification code. Please check and try again.'
				)
			case 'VERIFY_EMAIL_FAILED':
				return t.verifiedEmails.errors.verifyEmailFailed ?? 'Failed to verify email. Please try again.'
			case 'FETCH_EMAILS_FAILED':
				return t.verifiedEmails.errors.fetchEmailsFailed ?? 'Failed to load verified emails. Please refresh the page.'
			case 'DELETE_EMAIL_FAILED':
				return t.verifiedEmails.errors.deleteEmailFailed ?? 'Failed to delete email. Please try again.'
			case 'EMAIL_SEND_FAILED':
				return t.verifiedEmails.errors.emailSendFailed ?? 'Failed to send verification email. Please try again.'
			case 'RESEND_CODE_FAILED':
				return t.verifiedEmails.errors.resendCodeFailed ?? 'Failed to resend verification code. Please try again.'
			default:
				return errorCode // Fallback to the error code itself
		}
	}

	const [verifiedEmails, setVerifiedEmails] = useState<VerifiedEmail[]>([])
	const [newEmail, setNewEmail] = useState('')
	const [verificationCodes, setVerificationCodes] = useState<Record<string, string>>({})
	const [showAddEmail, setShowAddEmail] = useState(false)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [processingEmails, setProcessingEmails] = useState<Set<string>>(new Set())
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [emailToDelete, setEmailToDelete] = useState<string | null>(null)

	// Load verified emails on component mount
	useEffect(() => {
		async function loadVerifiedEmails() {
			try {
				setLoading(true)
				const result = await fetchVerifiedEmailsByUserId(user.id)
				if (result.success && result.data) {
					setVerifiedEmails(result.data)
				} else {
					console.error('Error loading verified emails:', result.error)
					setError(getErrorMessage(result.error ?? 'FETCH_EMAILS_FAILED'))
				}
			} catch (error) {
				console.error('Error loading verified emails:', error)
				setError(t.verifiedEmails.errors.loadFailed ?? 'Failed to load verified emails')
			} finally {
				setLoading(false)
			}
		}

		void loadVerifiedEmails()
	}, [user.id, getErrorMessage, t.verifiedEmails.errors.loadFailed])

	const handleAddEmail = async () => {
		if (!newEmail.trim() || !newEmail.includes('@')) {
			setError(t.verifiedEmails.errors.addInvalidEmail ?? 'Please enter a valid email address')
			return
		}

		setProcessingEmails(prev => new Set(prev).add('new'))
		setError(null)

		try {
			const result = await createVerifiedEmail({
				userId: user.id,
				email: newEmail.trim(),
			})
			if (result.success && result.data) {
				const newEmail = result.data
				setVerifiedEmails(prev => [...prev, newEmail])
				setNewEmail('')
				setShowAddEmail(false)
				toast.success(t.verifiedEmails.success.addSuccess)
				// Notify parent component that an email was added
				onEmailVerified?.()
			} else {
				const errorMessage = getErrorMessage(result.error ?? 'CREATE_EMAIL_FAILED')
				setError(errorMessage)
				toast.error(errorMessage)
			}
		} catch (error) {
			console.error('Error adding email:', error)
			const errorMessage = t.verifiedEmails.errors.addFailed ?? 'Failed to add email. Please try again.'
			setError(errorMessage)
			toast.error(errorMessage)
		} finally {
			setProcessingEmails(prev => {
				const next = new Set(prev)
				next.delete('new')
				return next
			})
		}
	}

	const handleVerifyEmail = async (emailId: string) => {
		const code = verificationCodes[emailId]
		if (!code || code.length !== 6) {
			setError(t.verifiedEmails.errors.verifyInvalidCode ?? 'Please enter a valid 6-digit verification code')
			return
		}

		setProcessingEmails(prev => new Set(prev).add(emailId))
		setError(null)

		try {
			const result = await verifyEmail({
				verifiedEmailId: emailId,
				verificationCode: code,
			})
			if (result.success && result.data) {
				const updatedEmail = result.data
				setVerifiedEmails(prev => prev.map(email => (email.id === emailId ? updatedEmail : email)))
				setVerificationCodes(prev => {
					const next = { ...prev }
					delete next[emailId]
					return next
				})
				toast.success('Email verified successfully')
				// Notify parent component that an email was verified
				onEmailVerified?.()
			} else {
				const errorMessage = getErrorMessage(result.error ?? 'VERIFY_EMAIL_FAILED')
				setError(errorMessage)
				toast.error(errorMessage)
			}
		} catch (error) {
			console.error('Error verifying email:', error)
			const errorMessage = t.verifiedEmails.errors.verifyFailed ?? 'Failed to verify email. Please try again.'
			setError(errorMessage)
			toast.error(errorMessage)
		} finally {
			setProcessingEmails(prev => {
				const next = new Set(prev)
				next.delete(emailId)
				return next
			})
		}
	}

	const handleResendCode = async (emailId: string) => {
		setProcessingEmails(prev => new Set(prev).add(emailId))
		setError(null)

		try {
			const result = await resendVerificationCode(emailId)
			if (result.success) {
				toast.success('Verification code sent')
			} else {
				const errorMessage = getErrorMessage(result.error ?? 'RESEND_CODE_FAILED')
				setError(errorMessage)
				toast.error(errorMessage)
			}
		} catch (error) {
			console.error('Error resending code:', error)
			const errorMessage =
				t.verifiedEmails.errors.resendFailed ?? 'Failed to resend verification code. Please try again.'
			setError(errorMessage)
			toast.error(errorMessage)
		} finally {
			setProcessingEmails(prev => {
				const next = new Set(prev)
				next.delete(emailId)
				return next
			})
		}
	}

	const handleDeleteEmail = (emailId: string) => {
		setEmailToDelete(emailId)
		setDeleteDialogOpen(true)
	}

	const confirmDeleteEmail = async () => {
		if (emailToDelete == null) return

		setProcessingEmails(prev => new Set(prev).add(emailToDelete))
		setError(null)

		try {
			const result = await deleteVerifiedEmail(emailToDelete)
			if (result.success) {
				setVerifiedEmails(prev => prev.filter(email => email.id !== emailToDelete))
				toast.success('Email deleted successfully')
			} else {
				const errorMessage = getErrorMessage(result.error ?? 'DELETE_EMAIL_FAILED')
				setError(errorMessage)
				toast.error(errorMessage)
			}
		} catch (error) {
			console.error('Error deleting email:', error)
			const errorMessage = t.verifiedEmails.errors.deleteFailed ?? 'Failed to delete email. Please try again.'
			setError(errorMessage)
			toast.error(errorMessage)
		} finally {
			setProcessingEmails(prev => {
				const next = new Set(prev)
				next.delete(emailToDelete)
				return next
			})
			setDeleteDialogOpen(false)
			setEmailToDelete(null)
		}
	}

	const updateVerificationCode = (emailId: string, code: string) => {
		setVerificationCodes(prev => ({
			...prev,
			[emailId]: code.replace(/\D/g, '').slice(0, 6), // Only allow 6 digits
		}))
	}

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MailIcon className="h-5 w-5" />
						{t.verifiedEmails.title ?? 'Verified Email Addresses'}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">{t.verifiedEmails.loading ?? 'Loading...'}</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			{/* Contact Email Selector */}
			{showContactEmailSelector && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MailIcon className="h-5 w-5" />
							{t.verifiedEmails.selectContactEmail ?? 'Select Contact Email'}
						</CardTitle>
						<CardDescription>
							{t.verifiedEmails.selectContactEmailDescription ??
								'Choose which email address should be used for contact purposes'}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<RadioGroup value={selectedContactEmailId} onValueChange={onContactEmailSelect}>
							<div className="space-y-3">
								{/* Primary account email option */}
								<div className="flex items-center space-x-3">
									<RadioGroupItem value="main-email" id="main-email-contact" />
									<Label htmlFor="main-email-contact" className="flex-1 cursor-pointer">
										<div className="flex items-center gap-2">
											<span>{user.email}</span>
											<Badge variant="secondary">{t.verifiedEmails.primary ?? 'Primary'}</Badge>
											<CheckIcon className="h-4 w-4 text-green-600" />
										</div>
									</Label>
								</div>

								{/* Verified emails */}
								{verifiedEmails
									.filter(email => email.isVerified)
									.map(email => (
										<div key={email.id} className="flex items-center space-x-3">
											<RadioGroupItem value={email.id} id={`contact-${email.id}`} />
											<Label htmlFor={`contact-${email.id}`} className="flex-1 cursor-pointer">
												<div className="flex items-center gap-2">
													<span>{email.email}</span>
													<CheckIcon className="h-4 w-4 text-green-600" />
												</div>
											</Label>
										</div>
									))}
							</div>
						</RadioGroup>

						{selectedContactEmailId != null && (
							<Alert className="mt-4">
								<CheckIcon className="h-4 w-4" />
								<AlertDescription>
									{t.verifiedEmails.selectedContactEmail ?? 'Selected contact email'}:{' '}
									{selectedContactEmailId === 'main-email'
										? user.email
										: verifiedEmails.find(e => e.id === selectedContactEmailId)?.email}
								</AlertDescription>
							</Alert>
						)}
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MailIcon className="text-primary h-5 w-5" />
						{t.verifiedEmails.title ?? 'Verified Email Addresses'}
					</CardTitle>
					<CardDescription>
						{t.verifiedEmails.description ??
							'Manage the email addresses associated with your account. Verified emails are used exclusively for important platform communications such as payment confirmations, event registrations, and security notifications. They will never be used for commercial marketing purposes.'}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{(error?.length ?? 0) > 0 && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Primary account email */}
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<span>{user.email}</span>
								<Badge variant="secondary">{t.verifiedEmails.primary ?? 'Primary'}</Badge>
								<CheckIcon className="h-4 w-4 text-green-600" />
							</div>
						</div>
					</div>

					{/* Verified emails */}
					{verifiedEmails.map(email => (
						<div key={email.id} className="flex items-center justify-between rounded-lg border p-4">
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<span>{email.email}</span>
									{email.isVerified && <CheckIcon className="h-4 w-4 text-green-600" />}
								</div>
							</div>
							<div className="flex items-center gap-2">
								{!email.isVerified && (
									<>
										<Input
											type="text"
											placeholder={t.verifiedEmails.codePlaceholder ?? '6-digit code'}
											value={verificationCodes[email.id] || ''}
											onChange={e => updateVerificationCode(email.id, e.target.value)}
											className="h-12 w-32"
											maxLength={6}
											disabled={processingEmails.has(email.id)}
										/>
										<Button
											size="sm"
											onClick={() => void handleVerifyEmail(email.id)}
											className="h-12"
											disabled={
												processingEmails.has(email.id) ||
												!verificationCodes[email.id] ||
												verificationCodes[email.id].length !== 6
											}
										>
											{t.verifiedEmails.buttons.verify ?? 'Verify'}
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => void handleResendCode(email.id)}
											className="h-12"
											disabled={processingEmails.has(email.id)}
										>
											{t.verifiedEmails.buttons.resend ?? 'Resend'}
										</Button>
									</>
								)}
								<Button
									size="sm"
									variant="destructive"
									className="h-12 w-12"
									onClick={() => void handleDeleteEmail(email.id)}
									disabled={processingEmails.has(email.id)}
								>
									<TrashIcon className="h-4 w-4" />
								</Button>
							</div>
						</div>
					))}

					{/* Add new email */}
					{!showAddEmail ? (
						<Button variant="outline" onClick={() => setShowAddEmail(true)} className="w-full">
							<PlusIcon className="mr-2 h-4 w-4" />
							{t.verifiedEmails.buttons.addEmail ?? 'Add Email Address'}
						</Button>
					) : (
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<Input
									type="email"
									placeholder={t.verifiedEmails.buttons.enterEmailPlaceholder ?? 'Enter email address'}
									value={newEmail}
									onChange={e => setNewEmail(e.target.value)}
									onKeyPress={e => e.key === 'Enter' && !processingEmails.has('new') && void handleAddEmail()}
									className="h-12 w-full md:w-72"
									disabled={processingEmails.has('new')}
								/>
								<Button
									onClick={() => void handleAddEmail()}
									className="h-12 border-black/50"
									disabled={processingEmails.has('new') || !newEmail.trim() || !newEmail.includes('@')}
								>
									{t.verifiedEmails.buttons.add ?? 'Add'}
								</Button>
								<Button
									variant="outline"
									onClick={() => {
										setShowAddEmail(false)
										setNewEmail('')
										setError(null)
									}}
									className="h-12 border-black/50 py-0"
									disabled={processingEmails.has('new')}
								>
									{t.verifiedEmails.buttons.cancel ?? 'Cancel'}
								</Button>
							</div>
							<p className="text-muted-foreground text-sm">
								{t.verifiedEmails.info ??
									'A verification code will be sent to this email address. The code expires in 15 minutes.'}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.verifiedEmails.confirmDelete ?? 'Delete Email Address'}</AlertDialogTitle>
						<AlertDialogDescription>
							{t.verifiedEmails.confirmDeleteDescription ??
								'Are you sure you want to delete this email address? This action cannot be undone.'}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.verifiedEmails.buttons.cancel ?? 'Cancel'}</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => void confirmDeleteEmail()}
							disabled={emailToDelete != null ? processingEmails.has(emailToDelete) : false}
						>
							{t.verifiedEmails.buttons.delete ?? 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
