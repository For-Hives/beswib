'use client'

import { CheckCircle, AlertCircle, Mail } from 'lucide-react'

import { useQueryState } from 'nuqs'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n/config'

import waitlistTranslations from './locales.json'

interface WaitlistNotificationsProps {
	eventId: string
	eventName: string
	locale: Locale
}

export function WaitlistNotifications({ locale, eventName, eventId }: WaitlistNotificationsProps) {
	const t = getTranslations(locale, waitlistTranslations)
	const [waitlistSuccess] = useQueryState('waitlist_success')
	const [waitlistError] = useQueryState('waitlist_error')
	const [subscribedEmail] = useQueryState('email')

	const isWaitlistSuccess = waitlistSuccess === 'true'
	const hasError = waitlistError != null && waitlistError !== ''
	const hasSubscribedEmail = subscribedEmail != null && subscribedEmail !== ''

	// Close handlers
	const handleClose = () => {
		// Navigate back to the clean URL without query params
		window.history.replaceState({}, '', `/${locale}/events/${eventId}`)
	}

	// Dynamic messages based on locale
	// Success email message from translations
	const getSuccessEmailMessage = () => t.messages.successEmail.replace('{eventName}', eventName)

	// Success sub message from translations
	const getSuccessSubMessage = () => t.messages.successSub

	// Button texts from translations
	const buttonTexts = {
		understood: t.buttons.understood,
		success: t.buttons.success,
		retry: t.buttons.retry,
		info: t.messages.info,
		error: t.messages.error,
		contactSupport: t.buttons.contactSupport,
	}

	if (!isWaitlistSuccess && !hasError) {
		return null
	}

	return (
		<>
			{/* Success Dialog */}
			{isWaitlistSuccess && (
				<Dialog open={true} onOpenChange={open => !open && handleClose()}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<div className="mb-4 flex items-center gap-3">
								<div className="rounded-full bg-green-100 p-2">
									<CheckCircle className="h-6 w-6 text-green-600" />
								</div>
								<DialogTitle className="text-green-600">{t.waitlist.success.title}</DialogTitle>
							</div>
						</DialogHeader>
						<div className="space-y-4">
							<div className="text-center">
								{hasSubscribedEmail ? (
									<div className="space-y-3">
										<div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
											<Mail className="h-4 w-4" />
											<span>{subscribedEmail}</span>
										</div>
										<p className="text-muted-foreground">{getSuccessEmailMessage()}</p>
									</div>
								) : (
									<p className="text-muted-foreground">{t.messages.successEmail.replace('{eventName}', eventName)}</p>
								)}
							</div>
							<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
								<p className="text-sm text-green-700">{getSuccessSubMessage()}</p>
							</div>
						</div>
						<DialogFooter className="justify-end">
							<Button onClick={handleClose} className="w-full sm:w-auto">
								{buttonTexts.success}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Error Dialog */}
			{hasError && (
				<Dialog open={true} onOpenChange={open => !open && handleClose()}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<div className="mb-4 flex items-center gap-3">
								<div className="rounded-full bg-red-100 p-2">
									<AlertCircle className="h-6 w-6 text-red-600" />
								</div>
								<DialogTitle className="text-red-600">{t.waitlist.error.title}</DialogTitle>
							</div>
						</DialogHeader>
						<div className="space-y-4">
							<div className="text-center">
								<p className="text-muted-foreground">
									{waitlistError === 'already_added'
										? t.waitlist.error.alreadyAdded.replace('{eventName}', eventName)
										: waitlistError === 'already_added_email'
											? t.messages.alreadyAddedEmail
											: t.messages.error}
								</p>
							</div>
							{waitlistError === 'already_added' || waitlistError === 'already_added_email' ? (
								<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
									<p className="text-sm text-blue-700">{buttonTexts.info}</p>
								</div>
							) : (
								<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
									<p className="text-sm text-red-700">{buttonTexts.error}</p>
								</div>
							)}
						</div>
						<DialogFooter className="gap-2">
							{waitlistError === 'failed' && (
								<Button variant="outline" onClick={handleClose}>
									{buttonTexts.contactSupport}
								</Button>
							)}
							<Button onClick={handleClose}>
								{waitlistError === 'failed' ? buttonTexts.retry : buttonTexts.understood}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	)
}
