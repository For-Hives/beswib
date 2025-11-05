'use client'

import { useAuth } from '@clerk/nextjs'
import { Bell, CheckCircle2, Mail, User } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import type { User as UserModel } from '@/models/user.model'
import { addToWaitlist } from '@/services/waitlist.services'

import eventWaitlistTranslations from './locales/EventWaitlistCard.locales.json'

interface EventWaitlistCardProps {
	eventId: string
	eventName: string
	locale: Locale
	user?: UserModel | null
	className?: string
}

export function EventWaitlistCard({ user, locale, eventName, eventId, className = '' }: EventWaitlistCardProps) {
	const { isSignedIn } = useAuth()
	const [email, setEmail] = useState('')
	const [isSubmitting, startTransition] = useTransition()
	const [isSubscribed, setIsSubscribed] = useState(false)

	const t = getTranslations(locale, eventWaitlistTranslations)

	const handleSubscribe = () => {
		if (isSignedIn !== true && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
			toast.error(t.validation.pleaseEnterValidEmail ?? 'Veuillez entrer une adresse email valide')
			return
		}

		startTransition(async () => {
			try {
				const result = await addToWaitlist(eventId, user ?? null, isSignedIn === true ? undefined : email)

				if (result?.error === 'already_on_waitlist') {
					toast.info(
						t.messages.alreadySubscribedDesc.replace('{eventName}', eventName) ||
							`Vous êtes déjà inscrit à la liste d'attente pour ${eventName}.`
					)
				} else if (result) {
					setIsSubscribed(true)
					toast.success(
						t.messages.subscriptionSuccessDesc.replace('{eventName}', eventName) ||
							`Vous recevrez une notification lorsqu'un dossard sera disponible pour ${eventName}.`
					)
				} else {
					throw new Error('Failed to add to waitlist')
				}
			} catch (error) {
				console.error('Error adding to waitlist:', error)
				toast.error(t.messages.subscriptionErrorDesc || 'Une erreur est survenue. Veuillez réessayer.')
			}
		})
	}

	if (isSubscribed) {
		return (
			<div className={`border-border/50 bg-card/50 rounded-lg border p-4 backdrop-blur-sm ${className}`}>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/15 px-2.5 py-1">
						<CheckCircle2 className="h-4 w-4 text-green-400" />
					</div>
					<div className="flex-1">
						<h3 className="text-primary mb-1 text-sm font-semibold">
							{t.messages.subscriptionConfirmed || 'Inscription confirmée !'}
						</h3>
						<p className="text-foreground/80 text-sm">
							{t.messages.subscriptionConfirmedDesc.replace('{eventName}', eventName) ||
								`Nous vous préviendrons pour ${eventName}.`}
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className={`border-border/50 bg-card/50 rounded-lg border p-4 backdrop-blur-sm ${className}`}>
			<h3 className="text-primary mb-3 flex items-center gap-2 text-sm font-semibold">
				<Bell className="h-4 w-4" />
				{t.title || 'Intéressé par cet événement ?'}
			</h3>

			<div className="space-y-4">
				<p className="text-foreground/80 text-sm leading-relaxed">
					{t.description ||
						"Ce prix ne vous convient pas ? Inscrivez-vous à la liste d'attente pour recevoir une notification d'une prochaine mise en vente sur l'événement."}
				</p>

				{isSignedIn !== true && (
					<div className="space-y-2">
						<Label htmlFor="waitlist-email" className="text-muted-foreground text-xs font-medium">
							{t.form.emailLabel || 'Votre adresse email'}
						</Label>
						<div className="relative">
							<Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
							<Input
								id="waitlist-email"
								type="email"
								placeholder={t.form.emailPlaceholder || 'votre@email.com'}
								value={email}
								onChange={e => setEmail(e.target.value)}
								className="border-border/30 focus:border-primary pl-10"
								disabled={isSubmitting}
							/>
						</div>
					</div>
				)}

				{isSignedIn === true && user != null && (
					<div className="border-border/30 bg-card/30 flex items-center gap-2 rounded-lg border p-3">
						<User className="text-muted-foreground h-4 w-4" />
						<span className="text-foreground text-sm">
							{t.form.signedInAs?.replace('{name}', `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()) ??
								`Connecté en tant que ${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()}
						</span>
					</div>
				)}

				<Button
					onClick={handleSubscribe}
					disabled={isSubmitting}
					className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
				>
					{isSubmitting
						? t.form.subscribing || 'Inscription en cours...'
						: t.form.subscribe || "S'inscrire à la liste d'attente"}
				</Button>

				<p className="text-muted-foreground text-xs">
					{t.disclaimer ||
						"Vous recevrez un email de notification uniquement lorsqu'un dossard sera disponible pour cet événement."}
				</p>
			</div>
		</div>
	)
}
