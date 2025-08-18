'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import EventEditForm from '@/components/admin/event/event-edit-form'
import { getEventByIdAction } from '@/app/[locale]/admin/actions'
import Translations from '@/app/[locale]/admin/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Event } from '@/models/event.model'
import { User } from '@/models/user.model'
import { Locale } from '@/lib/i18n/config'

interface AdminEventEditPageClientProps {
	currentUser: null | User
	locale: Locale
	eventId: string
}

export default function AdminEventEditPageClient({ locale, eventId, currentUser }: AdminEventEditPageClientProps) {
	const t = getTranslations(locale, Translations)

	const router = useRouter()
	const [isSuccess, setIsSuccess] = useState(false)
	const [updatedEvent, setUpdatedEvent] = useState<Event | null>(null)
	const [event, setEvent] = useState<Event | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Fetch the event data
	useEffect(() => {
		const fetchEvent = async () => {
			try {
				setIsLoading(true)
				const result = await getEventByIdAction(eventId)

				if (result.success && result.data) {
					setEvent(result.data)
				} else {
					setError(result.error ?? 'Failed to load event')
				}
			} catch (err) {
				setError('Failed to load event')
				console.error('Error fetching event:', err)
			} finally {
				setIsLoading(false)
			}
		}

		void fetchEvent()
	}, [eventId])

	const handleSuccess = (event: Event) => {
		setUpdatedEvent(event)
		setIsSuccess(true)
	}

	const handleCancel = () => {
		router.push('/admin/event/')
	}

	// Safety check - if currentUser is null, show error
	if (!currentUser) {
		return (
			<div className="from-background via-destructive/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--destructive)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--destructive)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-red-600 dark:text-red-400">⚠</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">{t.dashboard.errors.accessError}</h1>
						<p className="text-muted-foreground mb-6 text-lg">{t.dashboard.errors.accessErrorMessage}</p>
						<button
							className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
							onClick={() => router.push('/auth/sign-in')}
						>
							{t.dashboard.ui.signIn}
						</button>
					</div>
				</div>
			</div>
		)
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-blue-600 dark:text-blue-400">⏳</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">Loading...</h1>
						<p className="text-muted-foreground mb-6 text-lg">Chargement de l'événement...</p>
					</div>
				</div>
			</div>
		)
	}

	// Error state
	if (error != null || event == null) {
		return (
			<div className="from-background via-destructive/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--destructive)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--destructive)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-red-600 dark:text-red-400">⚠</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">Erreur</h1>
						<p className="text-muted-foreground mb-6 text-lg">{error}</p>
						<button className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white" onClick={handleCancel}>
							Retour à la liste
						</button>
					</div>
				</div>
			</div>
		)
	}

	// Success state
	if (isSuccess && updatedEvent) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-green-600 dark:text-green-400">✓</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">Événement modifié !</h1>
						<p className="text-muted-foreground mb-6 text-lg">
							L'événement "{updatedEvent.name}" a été modifié avec succès.
						</p>
						<button className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white" onClick={handleCancel}>
							Retour à la liste
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div>
			{/* Admin header with user info */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">{t.dashboard.ui.connectedAs}</p>
						<p className="text-foreground font-medium">
							{currentUser.firstName ?? t.dashboard.ui.anonymous} {currentUser.lastName ?? t.dashboard.ui.empty} (
							{currentUser.email})
						</p>
					</div>
					<div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
						{currentUser.role.toUpperCase()}
					</div>
				</div>
			</div>
			<EventEditForm locale={locale} onCancel={handleCancel} onSuccess={handleSuccess} event={event} />
		</div>
	)
}
