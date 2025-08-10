import type { Metadata } from 'next'

import { ArrowLeft, Bell } from 'lucide-react'

import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

import type { Event } from '@/models/event.model'
import type { Bib } from '@/models/bib.model'

import { fetchPubliclyListedBibsForEvent } from '@/services/bib.services'
import { generateLocaleParams } from '@/lib/generateStaticParams'
import { fetchUserByClerkId } from '@/services/user.services'
import { addToWaitlist } from '@/services/waitlist.services'
import { fetchEventById } from '@/services/event.services'
import { formatDateObjectForDisplay } from '@/lib/dateUtils'
import { getTranslations } from '@/lib/getDictionary'
import { Locale } from '@/lib/i18n-config'
import eventTranslations from './locales.json'

type EventDetailPageProps = {
	params: Promise<{
		id: string
		locale: Locale
	}>
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EventDetailPage({ searchParams, params }: EventDetailPageProps) {
	const { locale, id: eventId } = await params

	const resolvedSearchParams = await searchParams
	const { userId: clerkId } = await auth()

	const event: Event | null = await fetchEventById(eventId)
	const t = getTranslations(locale, eventTranslations)

	if (!event) {
		notFound()
	}

	const publiclyListedBibs: Bib[] = await fetchPubliclyListedBibsForEvent(eventId)

	async function handleJoinWaitlist(formData: FormData) {
		'use server'
		if (clerkId != null) {
			const eventIdFromForm = formData.get('eventId') as string
			const user = await fetchUserByClerkId(clerkId)
			const result = await addToWaitlist(eventIdFromForm, user)

			if (result && result.error === 'already_on_waitlist') {
				redirect(`/events/${eventIdFromForm}?waitlist_error=already_added`)
			} else if (result) {
				redirect(`/events/${eventIdFromForm}?waitlist_success=true`)
			} else {
				redirect(`/events/${eventIdFromForm}?waitlist_error=failed`)
			}
		} else {
			// Redirect to sign-in if user is not authenticated
			redirect('/sign-in')
		}
	}

	const waitlistSuccess = resolvedSearchParams?.waitlist_success === 'true'
	const waitlistError = resolvedSearchParams?.waitlist_error

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

			<div className="relative pt-12 pb-12">
				<div className="container mx-auto max-w-6xl p-6">
					{/* Success Modal-like Notification */}
					{waitlistSuccess && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
							<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md">
								<div className="mb-6 text-6xl text-green-600 dark:text-green-400">{t.event.waitlist.success.icon}</div>
								<h1 className="text-foreground mb-4 text-3xl font-bold">{t.event.waitlist.success.title}</h1>
								<p className="text-muted-foreground mb-6 text-lg">
									{t.event.waitlist.success.message.replace('{eventName}', event.name)}
								</p>
								<Link
									className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
									href={`/events/${eventId}`}
								>
									OK
								</Link>
							</div>
						</div>
					)}

					{/* Error Modal-like Notification */}
					{waitlistError != null && typeof waitlistError === 'string' && waitlistError !== '' && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
							<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-red-500/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--destructive)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--destructive)/0.2)] backdrop-blur-md">
								<div className="mb-6 text-6xl text-red-600 dark:text-red-400">{t.event.waitlist.error.icon}</div>
								<h1 className="text-foreground mb-4 text-3xl font-bold">{t.event.waitlist.error.title}</h1>
								<p className="text-muted-foreground mb-6 text-lg">
									{waitlistError === 'already_added'
										? t.event.waitlist.error.alreadyAdded.replace('{eventName}', event.name)
										: t.event.waitlist.error.failed}
								</p>
								<Link
									className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
									href={`/events/${eventId}`}
								>
									OK
								</Link>
							</div>
						</div>
					)}

					{/* Page Header */}
					<div className="mb-12 space-y-2 text-center">
						<h1 className="text-foreground text-4xl font-bold tracking-tight">{event.name}</h1>
						<p className="text-muted-foreground text-lg">{t.event.title}</p>
					</div>

					{/* Event Details Card */}
					<div className="mb-8">
						<div className="dark:border-border/50 bg-card/80 rounded-3xl border border-black/50 p-8 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-sm">
							<div className="grid gap-6 md:grid-cols-2">
								<div>
									<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.date}</h3>
									<p className="text-muted-foreground">{formatDateObjectForDisplay(event.eventDate, locale)}</p>
								</div>
								<div>
									<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.location}</h3>
									<p className="text-muted-foreground">{event.location}</p>
								</div>
							</div>
							{event.description != null && event.description !== '' && (
								<div className="mt-6">
									<h3 className="text-foreground mb-2 text-lg font-semibold">Description</h3>
									<p className="text-muted-foreground">{event.description}</p>
								</div>
							)}
						</div>
					</div>

					{/* Bibs Section */}
					<div className="dark:border-border/50 bg-card/80 rounded-3xl border border-black/50 p-8 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-sm">
						<h2 className="text-foreground mb-6 text-2xl font-bold">{t.event.bibs.title}</h2>

						{publiclyListedBibs.length > 0 ? (
							<div className="grid gap-4">
								{publiclyListedBibs.map(bib => (
									<div
										className="dark:border-border/30 bg-card/40 hover:bg-card/60 flex flex-col justify-between rounded-2xl border p-6 transition-colors sm:flex-row sm:items-center"
										key={bib.id}
									>
										<div className="space-y-2">
											<div className="text-2xl font-bold text-[var(--accent-sporty)]">
												{t.event.bibs.price}: ${bib.price.toFixed(2)}
											</div>
											{bib.originalPrice != null && bib.originalPrice !== 0 && !isNaN(bib.originalPrice) && (
												<p className="text-muted-foreground text-sm">
													{t.event.bibs.originalPrice}: ${bib.originalPrice.toFixed(2)}
												</p>
											)}
											<div className="flex gap-4">
												{bib.optionValues.size != null && bib.optionValues.size !== '' && (
													<p className="text-muted-foreground text-sm">
														{t.event.bibs.size}: {bib.optionValues.size}
													</p>
												)}
												{bib.optionValues.gender != null && (
													<p className="text-muted-foreground text-sm">
														{t.event.bibs.gender}: {bib.optionValues.gender}
													</p>
												)}
											</div>
										</div>
										<Link
											className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4 rounded-xl px-6 py-3 font-medium transition sm:mt-0"
											href={`/purchase/${bib.id}`}
										>
											{t.event.bibs.buyButton}
										</Link>
									</div>
								))}
							</div>
						) : (
							<div className="py-8 text-center">
								<div className="mb-6 text-6xl opacity-50">📋</div>
								<h3 className="text-foreground mb-4 text-xl font-semibold">{t.event.bibs.noBibsAvailable}</h3>
								<p className="text-muted-foreground mb-6">{t.event.waitlist.joinDescription}</p>

								<form action={handleJoinWaitlist} className="mx-auto max-w-xs">
									<input name="eventId" type="hidden" value={eventId} />
									<button
										className="bg-accent/20 hover:bg-accent/30 text-accent-foreground hover:text-foreground border-border flex w-full items-center justify-center gap-3 rounded-xl border px-6 py-3 font-medium backdrop-blur-md transition"
										type="submit"
									>
										<Bell className="h-5 w-5" />
										{t.event.waitlist.joinButton}
									</button>
								</form>
							</div>
						)}
					</div>

					{/* Back Button */}
					<div className="mt-8 text-center">
						<Link
							className="bg-accent/20 hover:bg-accent/30 text-accent-foreground hover:text-foreground border-border inline-flex items-center gap-3 rounded-xl border px-6 py-3 font-medium backdrop-blur-md transition"
							href="/events"
						>
							<ArrowLeft className="h-5 w-5" />
							{t.event.backToEvents}
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
	const { id } = await params
	const event = await fetchEventById(id)
	return {
		title: event ? `${event.name} | Event Details` : 'Event Not Found',
		description: event?.description ?? 'Details for the event.',
	}
}

// Generate static params for all locales
export function generateStaticParams() {
	return generateLocaleParams()
}
