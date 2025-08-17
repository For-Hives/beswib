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
import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale } from '@/lib/i18n/config'

import sellBibTranslations from '@/app/[locale]/dashboard/seller/sell-bib/locales.json'

interface EmailVerificationStepProps {
	user: User
	verifiedEmails: VerifiedEmail[]
	selectedEmailId?: string
	locale: Locale
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
	locale,
	onVerifyEmail,
	onResendCode,
	onEmailSelect,
	onAddEmail,
	error,
}: EmailVerificationStepProps) {
	const t = getTranslations(locale, sellBibTranslations)
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
				<h2 className="text-2xl font-bold tracking-tight">{t.form.emailVerification.title}</h2>
				<p className="text-muted-foreground mt-2">
					{t.form.emailVerification.description}
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
						{t.form.emailVerification.selectEmailTitle}
					</CardTitle>
					<CardDescription>{t.form.emailVerification.selectEmailDescription}</CardDescription>
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
												{emailOption.isDefault && <Badge variant="secondary">{t.form.emailVerification.accountEmail}</Badge>}
												{emailOption.isVerified && <CheckIcon className="h-4 w-4 text-green-600" />}
											</div>
											{!emailOption.isVerified && !emailOption.isDefault && (
												<div className="flex items-center gap-2">
													<Input
														type="text"
														placeholder={t.form.emailVerification.codeInput}
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
														{t.form.emailVerification.verify}
													</Button>
													<Button size="sm" variant="outline" onClick={() => onResendCode(emailOption.id)}>
														{t.form.emailVerification.resend}
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
					<CardTitle>{t.form.emailVerification.addEmailTitle}</CardTitle>
					<CardDescription>{t.form.emailVerification.addEmailDescription}</CardDescription>
				</CardHeader>
				<CardContent>
					{!showAddEmail ? (
						<Button variant="outline" onClick={() => setShowAddEmail(true)} className="w-full">
							<PlusIcon className="mr-2 h-4 w-4" />
							{t.form.emailVerification.addEmailButton}
						</Button>
					) : (
						<div className="space-y-4">
							<div className="flex gap-2">
								<Input
									type="email"
									placeholder={t.form.emailVerification.enterEmail}
									value={newEmail}
									onChange={e => setNewEmail(e.target.value)}
									onKeyPress={e => e.key === 'Enter' && handleAddEmail()}
									className="flex-1"
								/>
								<Button onClick={handleAddEmail} disabled={newEmail.trim() === '' || !newEmail.includes('@')}>
									{t.form.emailVerification.add}
								</Button>
								<Button
									variant="outline"
									onClick={() => {
										setShowAddEmail(false)
										setNewEmail('')
									}}
								>
									{t.form.emailVerification.cancel}
								</Button>
							</div>
							<p className="text-muted-foreground text-sm">{t.form.emailVerification.codeInfo}</p>
						</div>
					)}
				</CardContent>
			</Card>
			{selectedEmailId !== undefined && selectedEmailId !== null && selectedEmailId !== '' && (
				<Alert>
					<CheckIcon className="h-4 w-4" />
					<AlertDescription>{t.form.emailVerification.selected} {allEmailOptions.find(e => e.id === selectedEmailId)?.email}</AlertDescription>
				</Alert>
			)}
		</div>
	)
}
