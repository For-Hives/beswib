'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import EventCreationForm from '@/components/admin/event/event-creation-form'
import Translations from '@/app/[locale]/admin/locales.json'
import { getTranslations } from '@/lib/getDictionary'
import { Event } from '@/models/event.model'
import { User } from '@/models/user.model'
import { Locale } from '@/lib/i18n-config'
interface AdminEventPageClientProps {
	currentUser: null | User
	locale: Locale
}

export default function AdminEventPageClient({ locale, currentUser }: AdminEventPageClientProps) {
	const translations = getTranslations(locale, Translations)

	const router = useRouter()
	const [isSuccess, setIsSuccess] = useState(false)
	const [createdEvent, setCreatedEvent] = useState<Event | null>(null)

	const handleSuccess = (event: Event) => {
		setCreatedEvent(event)
		setIsSuccess(true)
	}

	const handleCancel = () => {
		router.push('/admin/events')
	}

	// Safety check - if currentUser is null, show error
	if (!currentUser) {
		return (
			<div className="from-background via-destructive/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="border-border/50 bg-card/80 w-full max-w-md rounded-3xl border p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--destructive)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--destructive)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-red-600 dark:text-red-400">⚠</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">Access Error</h1>
						<p className="text-muted-foreground mb-6 text-lg">
							Unable to verify admin access. Please try logging in again.
						</p>
						<button
							className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
							onClick={() => router.push('/sign-in')}
						>
							Sign In
						</button>
					</div>
				</div>
			</div>
		)
	}

	if (isSuccess && createdEvent) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="border-border/50 bg-card/80 w-full max-w-md rounded-3xl border p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-green-600 dark:text-green-400">✓</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">{translations.event.success.title}</h1>
						<p className="text-muted-foreground mb-6 text-lg">
							{translations.event.success.message.replace('{eventName}', createdEvent.name)}
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div>
			{/* Admin header with user info */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-24 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">Connected as</p>
						<p className="text-foreground font-medium">
							{currentUser.firstName ?? 'Anonymous'} {currentUser.lastName ?? ''} ({currentUser.email})
						</p>
					</div>
					<div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
						{currentUser.role.toUpperCase()}
					</div>
				</div>
			</div>
			<EventCreationForm locale={locale} onCancel={handleCancel} onSuccess={handleSuccess} />
		</div>
	)
}
