'use client'

import { CheckCircle, AlertCircle, Mail } from 'lucide-react'

import { useQueryState } from 'nuqs'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface WaitlistNotificationsProps {
	eventId: string
	eventName: string
	locale: string
	t: {
		event: {
			waitlist: {
				success: {
					icon: string
					title: string
					message: string
				}
				error: {
					icon: string
					title: string
					alreadyAdded: string
					failed: string
				}
			}
		}
	}
}

export function WaitlistNotifications({ t, locale, eventName, eventId }: WaitlistNotificationsProps) {
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
	const getSuccessEmailMessage = () => {
		switch (locale) {
			case 'fr':
				return `Parfait ! Vous recevrez des notifications à cette adresse email lorsque des dossards deviendront disponibles pour ${eventName}.`
			case 'es':
				return `¡Perfecto! Recibirás notificaciones en esta dirección de email cuando los dorsales estén disponibles para ${eventName}.`
			case 'it':
				return `Perfetto! Riceverai notifiche a questo indirizzo email quando i pettorali saranno disponibili per ${eventName}.`
			case 'de':
				return `Perfekt! Sie erhalten Benachrichtigungen an diese E-Mail-Adresse, wenn Startnummern für ${eventName} verfügbar werden.`
			case 'ro':
				return `Perfect! Veți primi notificări la această adresă de email când numerele de concurs vor fi disponibile pentru ${eventName}.`
			case 'pt':
				return `Perfeito! Receberás notificações neste endereço de email quando os dorsais estiverem disponíveis para ${eventName}.`
			case 'nl':
				return `Perfect! Je ontvangt meldingen op dit e-mailadres wanneer startnummers beschikbaar komen voor ${eventName}.`
			case 'ko':
				return `완벽합니다! ${eventName}에 빕이 사용 가능해지면 이 이메일 주소로 알림을 받으실 것입니다.`
			default:
				return `Great! You'll receive notifications at this email address when bibs become available for ${eventName}.`
		}
	}

	const getSuccessSubMessage = () => {
		switch (locale) {
			case 'fr':
				return "Nous vous contacterons dès qu'un dossard sera disponible !"
			case 'es':
				return '¡Te contactaremos tan pronto como haya un dorsal disponible!'
			case 'it':
				return 'Ti contatteremo appena sarà disponibile un pettorale!'
			case 'de':
				return 'Wir kontaktieren Sie, sobald eine Startnummer verfügbar ist!'
			case 'ro':
				return 'Vă vom contacta de îndată ce un număr de concurs va fi disponibil!'
			case 'pt':
				return 'Entraremos em contacto assim que um dorsal estiver disponível!'
			case 'nl':
				return 'We nemen contact op zodra er een startnummer beschikbaar is!'
			case 'ko':
				return '빕이 사용 가능해지면 즉시 연락드리겠습니다!'
			default:
				return "We'll contact you as soon as a bib becomes available!"
		}
	}

	const getEmailAlreadyAddedMessage = () => {
		switch (locale) {
			case 'fr':
				return 'Vous êtes déjà inscrit aux notifications pour cet événement avec cette adresse email.'
			case 'es':
				return 'Ya estás registrado para recibir notificaciones de este evento con esta dirección de email.'
			case 'it':
				return 'Sei già registrato per ricevere notifiche per questo evento con questo indirizzo email.'
			case 'de':
				return 'Sie sind bereits für Benachrichtigungen zu diesem Event mit dieser E-Mail-Adresse registriert.'
			case 'ro':
				return 'Sunteți deja înregistrat pentru notificări pentru acest eveniment cu această adresă de email.'
			case 'pt':
				return 'Já estás registado para receber notificações deste evento com este endereço de email.'
			case 'nl':
				return 'Je bent al geregistreerd voor meldingen voor dit evenement met dit e-mailadres.'
			case 'ko':
				return '이미 이 이메일 주소로 이 이벤트에 대한 알림에 등록되어 있습니다.'
			default:
				return 'You have already subscribed to notifications for this event with this email address.'
		}
	}

	const getButtonTexts = () => {
		switch (locale) {
			case 'fr':
				return {
					understood: 'Compris',
					success: 'Parfait !',
					retry: 'Réessayer',
					info: 'Pas de souci ! Vous recevrez toujours une notification si un dossard devient disponible.',
					error: "Une erreur s'est produite. Veuillez réessayer ou contactez notre support.",
					contactSupport: 'Contacter le support',
				}
			case 'es':
				return {
					understood: 'Entendido',
					success: '¡Perfecto!',
					retry: 'Reintentar',
					info: '¡No te preocupes! Aún recibirás una notificación si un dorsal está disponible.',
					error: 'Ha ocurrido un error. Inténtalo de nuevo o contacta nuestro soporte.',
					contactSupport: 'Contactar soporte',
				}
			case 'it':
				return {
					understood: 'Capito',
					success: 'Perfetto!',
					retry: 'Riprova',
					info: 'Non preoccuparti! Riceverai comunque una notifica se un pettorale diventa disponibile.',
					error: 'Si è verificato un errore. Riprova o contatta il nostro supporto.',
					contactSupport: 'Contatta il supporto',
				}
			case 'de':
				return {
					understood: 'Verstanden',
					success: 'Perfekt!',
					retry: 'Erneut versuchen',
					info: 'Kein Problem! Sie erhalten trotzdem eine Benachrichtigung, wenn eine Startnummer verfügbar wird.',
					error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie unseren Support.',
					contactSupport: 'Support kontaktieren',
				}
			case 'ro':
				return {
					understood: 'Înțeles',
					success: 'Perfect!',
					retry: 'Încercați din nou',
					info: 'Nu-i problemă! Veți primi în continuare o notificare dacă un număr de concurs devine disponibil.',
					error: 'A apărut o eroare. Vă rugăm să încercați din nou sau contactați suportul nostru.',
					contactSupport: 'Contactați suportul',
				}
			case 'pt':
				return {
					understood: 'Compreendido',
					success: 'Perfeito!',
					retry: 'Tentar novamente',
					info: 'Não se preocupe! Ainda receberás uma notificação se um dorsal ficar disponível.',
					error: 'Ocorreu um erro. Tente novamente ou contacte o nosso suporte.',
					contactSupport: 'Contactar suporte',
				}
			case 'nl':
				return {
					understood: 'Begrepen',
					success: 'Perfect!',
					retry: 'Opnieuw proberen',
					info: 'Geen probleem! Je ontvangt nog steeds een melding als een startnummer beschikbaar komt.',
					error: 'Er is een fout opgetreden. Probeer het opnieuw of neem contact op met onze ondersteuning.',
					contactSupport: 'Contact opnemen met ondersteuning',
				}
			case 'ko':
				return {
					understood: '이해했습니다',
					success: '완벽합니다!',
					retry: '다시 시도',
					info: '괜찮습니다! 빕이 사용 가능해지면 여전히 알림을 받으실 것입니다.',
					error: '오류가 발생했습니다. 다시 시도하거나 지원팀에 문의해주세요.',
					contactSupport: '지원팀 문의',
				}
			default:
				return {
					understood: 'Understood',
					success: 'Perfect!',
					retry: 'Try Again',
					info: "No worries! You'll still receive a notification if a bib becomes available.",
					error: 'An error occurred. Please try again or contact our support.',
					contactSupport: 'Contact Support',
				}
		}
	}

	if (!isWaitlistSuccess && !hasError) {
		return null
	}

	const buttonTexts = getButtonTexts()

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
								<DialogTitle className="text-green-600">{t.event.waitlist.success.title}</DialogTitle>
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
									<p className="text-muted-foreground">
										{t.event.waitlist.success.message.replace('{eventName}', eventName)}
									</p>
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
								<DialogTitle className="text-red-600">{t.event.waitlist.error.title}</DialogTitle>
							</div>
						</DialogHeader>
						<div className="space-y-4">
							<div className="text-center">
								<p className="text-muted-foreground">
									{waitlistError === 'already_added'
										? t.event.waitlist.error.alreadyAdded.replace('{eventName}', eventName)
										: waitlistError === 'already_added_email'
											? getEmailAlreadyAddedMessage()
											: t.event.waitlist.error.failed}
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
