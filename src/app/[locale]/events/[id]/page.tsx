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
import { Locale } from '@/lib/i18n-config'

type EventDetailPageProps = {
	params: Promise<{
		id: string
		locale: Locale
	}>
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EventDetailPage({ searchParams, params }: EventDetailPageProps) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { locale, id: eventId } = await params //TODO: add translations support later

	const resolvedSearchParams = await searchParams
	const { userId: clerkId } = await auth()

	const event: Event | null = await fetchEventById(eventId)

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
		<div className="mx-auto w-full max-w-4xl p-4 md:p-8">
			<div className="bg-card/80 border-border relative mx-auto flex w-full flex-col overflow-hidden rounded-2xl border p-5 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md transition-all duration-300 hover:border-white/35">
				<h1 className="mb-2 text-3xl font-bold text-gray-200">{event.name}</h1>
				<p className="text-md text-muted-foreground">
					<strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}
				</p>
				<p className="text-md text-muted-foreground">
					<strong>Location:</strong> {event.location}
				</p>
				{event.description != null && event.description !== '' && (
					<p className="text-foreground/80 mt-4">{event.description}</p>
				)}

				{waitlistSuccess && (
					<div className="mb-4 rounded-md border border-green-300 bg-[var(--success-bg)] p-3 text-center text-sm text-[var(--success-text)]">
						You've been successfully added to the waitlist for {event.name}! We'll notify you if a bib becomes
						available.
					</div>
				)}
				{waitlistError != null && typeof waitlistError === 'string' && waitlistError !== '' && (
					<div className="mb-4 rounded-md border border-red-300 bg-[var(--error-bg)] p-3 text-center text-sm text-[var(--error-text)]">
						{waitlistError === 'already_added'
							? `You are already on the waitlist for ${event.name}.`
							: 'Failed to add you to the waitlist. Please try again.'}
					</div>
				)}

				<div className="mt-8">
					<h2 className="text-foreground mb-4 text-xl font-semibold">Bibs Available for this Event :</h2>
					{publiclyListedBibs.length > 0 ? (
						<ul className="space-y-4">
							{publiclyListedBibs.map(bib => (
								<li className="bento-box flex flex-col justify-between sm:flex-row sm:items-center" key={bib.id}>
									<div>
										<div className="text-xl font-bold text-[var(--accent-sporty)]">Price: ${bib.price.toFixed(2)}</div>
										{bib.originalPrice != null && bib.originalPrice !== 0 && !isNaN(bib.originalPrice) && (
											<p className="text-xs text-gray-500 dark:text-gray-400">
												Original Price: ${bib.originalPrice.toFixed(2)}
											</p>
										)}
										{bib.optionValues.size != null && bib.optionValues.size !== '' && (
											<p className="text-sm text-gray-600 dark:text-gray-300">Size: {bib.optionValues.size}</p>
										)}
										{bib.optionValues.gender != null && (
											<p className="text-sm text-gray-600 dark:text-gray-300">Gender: {bib.optionValues.gender}</p>
										)}
									</div>
									<Link className="btn btn-primary mt-3 sm:mt-0" href={`/purchase/${bib.id}`}>
										Buy Bib
									</Link>
								</li>
							))}
						</ul>
					) : (
						<div className="bento-box text-center">
							<p className="mb-4 text-gray-700 dark:text-gray-300">
								No bibs currently listed for resale for this event.
							</p>
							<form action={handleJoinWaitlist} className="mx-auto inline-block w-full max-w-xs">
								<input name="eventId" type="hidden" value={eventId} />
								<button
									className="border-border bg-accent/20 text-accent-foreground hover:bg-accent/30 hover:text-foreground flex w-full min-w-[180px] items-center justify-center gap-2 rounded-lg border px-4 py-2 font-medium backdrop-blur-md transition"
									type="submit"
								>
									<Bell className="h-5 w-5" />
									Join Waitlist
								</button>
							</form>
							<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Be notified if a bib becomes available.</p>
						</div>
					)}
				</div>
			</div>
			<Link
				className="border-border bg-accent/20 text-accent-foreground hover:bg-accent/30 hover:text-foreground mx-auto mt-8 flex w-full max-w-4xl items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium backdrop-blur-md transition"
				href="/events"
			>
				<ArrowLeft className="h-5 w-5" />
				Back to events list
			</Link>
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
