'use client'

import { CheckIcon, MailIcon, PlusIcon, TrashIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import type { VerifiedEmail } from '@/models/verifiedEmail.model'
import type { User } from '@/models/user.model'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
	createVerifiedEmail,
	deleteVerifiedEmail,
	fetchVerifiedEmailsByUserId,
	resendVerificationCode,
	verifyEmail,
} from '@/services/verifiedEmail.services'

interface VerifiedEmailsManagerProps {
	user: User
	locale: string
}

export default function VerifiedEmailsManager({ user }: VerifiedEmailsManagerProps) {
	const [verifiedEmails, setVerifiedEmails] = useState<VerifiedEmail[]>([])
	const [newEmail, setNewEmail] = useState('')
	const [verificationCodes, setVerificationCodes] = useState<Record<string, string>>({})
	const [showAddEmail, setShowAddEmail] = useState(false)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [processingEmails, setProcessingEmails] = useState<Set<string>>(new Set())

	// Load verified emails on component mount
	useEffect(() => {
		async function loadVerifiedEmails() {
			try {
				setLoading(true)
				const emails = await fetchVerifiedEmailsByUserId(user.id)
				setVerifiedEmails(emails)
			} catch (error) {
				console.error('Error loading verified emails:', error)
				setError('Failed to load verified emails')
			} finally {
				setLoading(false)
			}
		}

		void loadVerifiedEmails()
	}, [user.id])

	const handleAddEmail = async () => {
		if (!newEmail.trim() || !newEmail.includes('@')) {
			setError('Please enter a valid email address')
			return
		}

		setProcessingEmails(prev => new Set(prev).add('new'))
		setError(null)

		try {
			const result = await createVerifiedEmail({ userId: user.id, email: newEmail.trim() })
			if (result) {
				setVerifiedEmails(prev => [...prev, result])
				setNewEmail('')
				setShowAddEmail(false)
			} else {
				setError('Failed to add email. Please try again.')
			}
		} catch (error) {
			console.error('Error adding email:', error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to add email. Please try again.'
			setError(errorMessage)
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
			setError('Please enter a valid 6-digit verification code')
			return
		}

		setProcessingEmails(prev => new Set(prev).add(emailId))
		setError(null)

		try {
			const result = await verifyEmail({ verifiedEmailId: emailId, verificationCode: code })
			if (result) {
				setVerifiedEmails(prev => prev.map(email => (email.id === emailId ? result : email)))
				setVerificationCodes(prev => {
					const next = { ...prev }
					delete next[emailId]
					return next
				})
			} else {
				setError('Invalid verification code or code has expired')
			}
		} catch (error) {
			console.error('Error verifying email:', error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to verify email. Please try again.'
			setError(errorMessage)
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
			const success = await resendVerificationCode(emailId)
			if (!success) {
				setError('Failed to resend verification code. Please try again.')
			}
		} catch (error) {
			console.error('Error resending code:', error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification code. Please try again.'
			setError(errorMessage)
		} finally {
			setProcessingEmails(prev => {
				const next = new Set(prev)
				next.delete(emailId)
				return next
			})
		}
	}

	const handleDeleteEmail = async (emailId: string) => {
		if (!confirm('Are you sure you want to delete this email?')) {
			return
		}

		setProcessingEmails(prev => new Set(prev).add(emailId))
		setError(null)

		try {
			const success = await deleteVerifiedEmail(emailId)
			if (success) {
				setVerifiedEmails(prev => prev.filter(email => email.id !== emailId))
			} else {
				setError('Failed to delete email. Please try again.')
			}
		} catch (error) {
			console.error('Error deleting email:', error)
			setError('Failed to delete email. Please try again.')
		} finally {
			setProcessingEmails(prev => {
				const next = new Set(prev)
				next.delete(emailId)
				return next
			})
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
						Verified Email Addresses
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Loading...</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MailIcon className="h-5 w-5" />
						Verified Email Addresses
					</CardTitle>
					<CardDescription>
						Manage the email addresses associated with your account. Verified emails can be used for event registrations.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Primary account email */}
					<div className="flex items-center justify-between p-4 border rounded-lg">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<span>{user.email}</span>
								<Badge variant="secondary">Primary</Badge>
								<CheckIcon className="h-4 w-4 text-green-600" />
							</div>
						</div>
					</div>

					{/* Verified emails */}
					{verifiedEmails.map(email => (
						<div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
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
											placeholder="6-digit code"
											value={verificationCodes[email.id] || ''}
											onChange={e => updateVerificationCode(email.id, e.target.value)}
											className="w-32"
											maxLength={6}
											disabled={processingEmails.has(email.id)}
										/>
										<Button
											size="sm"
											onClick={() => void handleVerifyEmail(email.id)}
											disabled={
												processingEmails.has(email.id) ||
												!verificationCodes[email.id] ||
												verificationCodes[email.id].length !== 6
											}
										>
											Verify
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => void handleResendCode(email.id)}
											disabled={processingEmails.has(email.id)}
										>
											Resend
										</Button>
									</>
								)}
								<Button
									size="sm"
									variant="destructive"
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
							Add Email Address
						</Button>
					) : (
						<div className="space-y-4">
							<div className="flex gap-2">
								<Input
									type="email"
									placeholder="Enter email address"
									value={newEmail}
									onChange={e => setNewEmail(e.target.value)}
									onKeyPress={e => e.key === 'Enter' && !processingEmails.has('new') && void handleAddEmail()}
									className="flex-1"
									disabled={processingEmails.has('new')}
								/>
								<Button
									onClick={() => void handleAddEmail()}
									disabled={processingEmails.has('new') || !newEmail.trim() || !newEmail.includes('@')}
								>
									Add
								</Button>
								<Button
									variant="outline"
									onClick={() => {
										setShowAddEmail(false)
										setNewEmail('')
										setError(null)
									}}
									disabled={processingEmails.has('new')}
								>
									Cancel
								</Button>
							</div>
							<p className="text-muted-foreground text-sm">
								A verification code will be sent to this email address. The code expires in 15 minutes.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
