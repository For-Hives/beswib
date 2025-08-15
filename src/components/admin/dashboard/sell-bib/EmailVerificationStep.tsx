import { CheckIcon, MailIcon, PlusIcon } from 'lucide-react'
import React, { useState } from 'react'

import type { VerifiedEmail } from '@/models/verifiedEmail.model'
import type { User } from '@/models/user.model'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface EmailVerificationStepProps {
	user: User
	verifiedEmails: VerifiedEmail[]
	selectedEmailId?: string
	onEmailSelect: (emailId: string) => void
	onAddEmail: (email: string) => void
	onVerifyEmail: (emailId: string, code: string) => void
	onResendCode: (emailId: string) => void
	error?: string
}

export default function EmailVerificationStep({
	verifiedEmails,
	user,
	selectedEmailId,
	onVerifyEmail,
	onResendCode,
	onEmailSelect,
	onAddEmail,
	error,
}: EmailVerificationStepProps) {
	const [newEmail, setNewEmail] = useState('')
	const [verificationCodes, setVerificationCodes] = useState<Record<string, string>>({})
	const [showAddEmail, setShowAddEmail] = useState(false)

	const handleAddEmail = () => {
		if (newEmail.trim() !== '' && newEmail.includes('@')) {
			onAddEmail(newEmail.trim())
			setNewEmail('')
			setShowAddEmail(false)
		}
	}

	const handleVerifyEmail = (emailId: string) => {
		const code = verificationCodes[emailId]
		if (code !== undefined && code !== null && code.length === 6) {
			onVerifyEmail(emailId, code)
		}
	}

	const updateVerificationCode = (emailId: string, code: string) => {
		setVerificationCodes(prev => ({
			...prev,
			[emailId]: code.replace(/\D/g, '').slice(0, 6), // Only allow 6 digits
		}))
	}

	// Add user's main email as default option if not already in verified emails
	const hasMainEmail = verifiedEmails.some(ve => ve.email === user.email)
	const defaultEmailOptions = hasMainEmail
		? []
		: [
				{
					isVerified: true,
					isDefault: true,
					id: 'main-email',
					email: user.email,
				},
			]

	const allEmailOptions = [
		...defaultEmailOptions,
		...verifiedEmails.map(ve => ({
			isVerified: ve.isVerified,
			isDefault: false,
			id: ve.id,
			email: ve.email,
		})),
	]

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Email Verification</h2>
				<p className="text-muted-foreground mt-2">
					Choose which email was used to register for this event. This helps verify your registration.
				</p>
			</div>
			{error !== undefined && error !== null && error !== '' && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}{' '}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MailIcon className="h-5 w-5" />
						Select Registration Email
					</CardTitle>
					<CardDescription>Choose the email address you used when registering for this event.</CardDescription>
				</CardHeader>
				<CardContent>
					<RadioGroup value={selectedEmailId} onValueChange={onEmailSelect}>
						<div className="space-y-4">
							{allEmailOptions.map(emailOption => (
								<div key={emailOption.id} className="flex items-center space-x-3">
									<RadioGroupItem value={emailOption.id} id={emailOption.id} />
									<Label htmlFor={emailOption.id} className="flex-1 cursor-pointer">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<span>{emailOption.email}</span>
												{emailOption.isDefault && <Badge variant="secondary">Account Email</Badge>}
												{emailOption.isVerified && <CheckIcon className="h-4 w-4 text-green-600" />}
											</div>
											{!emailOption.isVerified && !emailOption.isDefault && (
												<div className="flex items-center gap-2">
													<Input
														type="text"
														placeholder="6-digit code"
														value={verificationCodes[emailOption.id] || ''}
														onChange={e => updateVerificationCode(emailOption.id, e.target.value)}
														className="w-32"
														maxLength={6}
													/>
													<Button
														size="sm"
														onClick={() => handleVerifyEmail(emailOption.id)}
														disabled={
															verificationCodes[emailOption.id] === undefined ||
															verificationCodes[emailOption.id] === null ||
															verificationCodes[emailOption.id].length !== 6
														}
													>
														Verify
													</Button>
													<Button size="sm" variant="outline" onClick={() => onResendCode(emailOption.id)}>
														Resend
													</Button>
												</div>
											)}
										</div>
									</Label>
								</div>
							))}
						</div>
					</RadioGroup>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Add Another Email</CardTitle>
					<CardDescription>If you used a different email for registration, add it here.</CardDescription>
				</CardHeader>
				<CardContent>
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
									onKeyPress={e => e.key === 'Enter' && handleAddEmail()}
									className="flex-1"
								/>
								<Button onClick={handleAddEmail} disabled={newEmail.trim() === '' || !newEmail.includes('@')}>
									Add
								</Button>
								<Button
									variant="outline"
									onClick={() => {
										setShowAddEmail(false)
										setNewEmail('')
									}}
								>
									Cancel
								</Button>
							</div>
							<p className="text-muted-foreground text-sm">A verification code will be sent to this email address.</p>
						</div>
					)}
				</CardContent>
			</Card>
			{selectedEmailId !== undefined && selectedEmailId !== null && selectedEmailId !== '' && (
				<Alert>
					<CheckIcon className="h-4 w-4" />
					<AlertDescription>Selected: {allEmailOptions.find(e => e.id === selectedEmailId)?.email}</AlertDescription>
				</Alert>
			)}
		</div>
	)
}
