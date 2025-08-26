'use client'

import { Mail, Bell, User, CheckCircle2 } from 'lucide-react'
import { useState, useTransition } from 'react'

import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'

import type { User as UserModel } from '@/models/user.model'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { addToWaitlist } from '@/services/waitlist.services'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Locale } from '@/lib/i18n/config'

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
			<Card className={`border-green-200 bg-green-50 ${className}`}>
				<CardContent className="pt-6">
					<div className="flex items-center gap-3 text-center">
						<div className="rounded-full bg-green-100 p-2">
							<CheckCircle2 className="h-5 w-5 text-green-600" />
						</div>
						<div className="flex-1">
							<p className="font-medium text-green-800">
								{t.messages.subscriptionConfirmed || 'Inscription confirmée !'}
							</p>
							<p className="text-sm text-green-600">
								{t.messages.subscriptionConfirmedDesc.replace('{eventName}', eventName) ||
									`Nous vous préviendrons pour ${eventName}.`}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className={`border-blue-200 bg-blue-50 ${className}`}>
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 text-lg text-blue-800">
					<Bell className="h-5 w-5" />
					{t.title || 'Intéressé par cet événement ?'}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm text-blue-700">
					{t.description ||
						"Ce prix ne vous convient pas ? Inscrivez-vous à la liste d'attente pour recevoir une notification d'une prochaine mise en vente sur l'événement."}
				</p>

				{isSignedIn !== true && (
					<div className="space-y-2">
						<Label htmlFor="waitlist-email" className="text-sm font-medium text-blue-800">
							{t.form.emailLabel || 'Votre adresse email'}
						</Label>
						<div className="relative">
							<Mail className="absolute top-3 left-3 h-4 w-4 text-blue-500" />
							<Input
								id="waitlist-email"
								type="email"
								placeholder={t.form.emailPlaceholder || 'votre@email.com'}
								value={email}
								onChange={e => setEmail(e.target.value)}
								className="border-blue-200 pl-10 focus:border-blue-400"
								disabled={isSubmitting}
							/>
						</div>
					</div>
				)}

				{isSignedIn === true && user != null && (
					<div className="flex items-center gap-2 rounded-lg bg-blue-100 p-3">
						<User className="h-4 w-4 text-blue-600" />
						<span className="text-sm text-blue-700">
							{t.form.signedInAs?.replace('{name}', `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()) ??
								`Connecté en tant que ${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()}
						</span>
					</div>
				)}

				<Button onClick={handleSubscribe} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
					{isSubmitting
						? t.form.subscribing || 'Inscription en cours...'
						: t.form.subscribe || "S'inscrire à la liste d'attente"}
				</Button>

				<p className="text-xs text-blue-600">
					{t.disclaimer ||
						"Vous recevrez un email de notification uniquement lorsqu'un dossard sera disponible pour cet événement."}
				</p>
			</CardContent>
		</Card>
	)
}
