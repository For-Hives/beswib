import { SignedIn, SignedOut } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { ArrowLeft, Bell } from 'lucide-react'
import { DateTime } from 'luxon'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import CardMarket from '@/components/marketplace/CardMarket'
import { EventBreadcrumbs } from '@/components/seo/Breadcrumbs'

import { WaitlistNotifications } from '@/components/waitlist/WaitlistNotifications'
import WaitlistStatusClient from '@/components/waitlist/WaitlistStatusClient'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { generateEventMetadata } from '@/lib/seo/metadata-generators'
import { transformBibsToBibSales } from '@/lib/transformers/bib'
import { pbDateToLuxon } from '@/lib/utils/date'
import type { Bib } from '@/models/bib.model'
import type { Event } from '@/models/event.model'
import { fetchPubliclyListedBibsForEvent } from '@/services/bib.services'
import { fetchEventById } from '@/services/event.services'
import { fetchUserByClerkId } from '@/services/user.services'
import { addToWaitlist } from '@/services/waitlist.services'

import eventTranslations from './locales.json'

// Optionally enable ISR if you want periodic regeneration (does not force dynamic)
export const revalidate = 300

type EventDetailPageProps = {
	params: Promise<{
		id: string
		locale: Locale
	}>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
	const { locale, id: eventId } = await params

	const event: Event | null = await fetchEventById(eventId)
	const t = getTranslations(locale, eventTranslations)

	if (!event) {
		notFound()
	}

	const publiclyListedBibs: Bib[] = await fetchPubliclyListedBibsForEvent(eventId)
	const bibSales = transformBibsToBibSales(publiclyListedBibs)

	async function handleJoinWaitlist(formData: FormData) {
		'use server'
		const eventIdFromForm = formData.get('eventId') as string
		const userEmail = formData.get('email') as string | null

		// Determine auth at action time to avoid dynamic usage during render
		const { userId: clerkId } = await auth()

		if (clerkId != null) {
			// Authenticated user flow
			const user = await fetchUserByClerkId(clerkId)
			const result = await addToWaitlist(eventIdFromForm, user)

			if (result && result.error === 'already_on_waitlist') {
				redirect(`/${locale}/events/${eventIdFromForm}?waitlist_error=already_added`)
			} else if (result) {
				redirect(`/${locale}/events/${eventIdFromForm}?waitlist_success=true`)
			} else {
				redirect(`/${locale}/events/${eventIdFromForm}?waitlist_error=failed`)
			}
		} else if (userEmail != null && userEmail.trim() !== '') {
			// Email-only subscription flow
			const result = await addToWaitlist(eventIdFromForm, null, userEmail.trim())

			if (result && result.error === 'already_on_waitlist') {
				redirect(`/${locale}/events/${eventIdFromForm}?waitlist_error=already_added_email`)
			} else if (result) {
				redirect(
					`/${locale}/events/${eventIdFromForm}?waitlist_success=true&email=${encodeURIComponent(userEmail.trim())}`
				)
			} else {
				redirect(`/${locale}/events/${eventIdFromForm}?waitlist_error=failed`)
			}
		} else {
			// No authentication and no email provided - redirect to sign-in
			redirect(`/${locale}/sign-in`)
		}
	}

	// Local helpers for formatting various values
	const formatPbDate = (date: Date | string | null | undefined) => {
		const dt = pbDateToLuxon(date)
		if (dt == null) return ''
		return dt.setLocale(locale).toLocaleString(DateTime.DATE_FULL)
	}

	const formatPrice = (value?: number) => {
		if (value == null || Number.isNaN(value)) return ''
		try {
			return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(value)
		} catch {
			return `${value.toFixed(2)} €`
		}
	}

	const formatDistance = (value?: number) => {
		if (value == null || Number.isNaN(value)) return ''
		return `${value.toFixed(1)} km`
	}

	const formatElevation = (value?: number) => {
		if (value == null || Number.isNaN(value)) return ''
		return `${Math.round(value)} m`
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size:[24px_24px]"></div>

			<WaitlistNotifications eventId={eventId} eventName={event.name} locale={locale} />

			<div className="relative pt-12 pb-12">
				<div className="container mx-auto max-w-6xl p-6">
					{/* Breadcrumbs */}
					<div className="mb-6">
						<EventBreadcrumbs eventName={event.name} locale={locale} />
					</div>

					{/* Page Header */}
					<div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="text-center sm:text-left">
							<h1 className="text-foreground text-4xl font-bold tracking-tight">
								{event.name} - {t.event.pageTitle ?? 'Event Information'}
							</h1>
							<p className="text-muted-foreground text-lg">{t.event.title}</p>
						</div>
						<div className="text-right">
							<div className="text-muted-foreground text-sm">{t.event.date}</div>
							<div className="text-foreground text-xl font-semibold">{formatPbDate(event.eventDate)}</div>
						</div>
					</div>

					{/* Event Details Card */}
					<div className="mb-8">
						<div className="dark:border-border/50 bg-card/80 rounded-3xl border border-black/50 p-8 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-sm">
							<div className="grid gap-6 md:grid-cols-2">
								<div>
									<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.location}</h3>
									<p className="text-muted-foreground">{event.location}</p>
								</div>
								<div>
									<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.typeCourse}</h3>
									<p className="text-muted-foreground">{t.event.typeLabels[event.typeCourse]}</p>
								</div>

								{event.distanceKm != null && !Number.isNaN(event.distanceKm) && (
									<div>
										<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.distance}</h3>
										<p className="text-muted-foreground">{formatDistance(event.distanceKm)}</p>
									</div>
								)}

								{event.elevationGainM != null && !Number.isNaN(event.elevationGainM) && (
									<div>
										<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.elevationGain}</h3>
										<p className="text-muted-foreground">{formatElevation(event.elevationGainM)}</p>
									</div>
								)}

								{event.participants != null && event.participants > 0 && (
									<div>
										<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.participants}</h3>
										<p className="text-muted-foreground">{event.participants}</p>
									</div>
								)}

								{event.officialStandardPrice != null && !Number.isNaN(event.officialStandardPrice) && (
									<div>
										<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.officialPrice}</h3>
										<p className="text-muted-foreground">{formatPrice(event.officialStandardPrice)}</p>
									</div>
								)}

								{event.parcoursUrl != null && event.parcoursUrl !== '' && (
									<div>
										<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.courseMap}</h3>
										<p className="text-muted-foreground">
											<Link
												className="text-primary underline"
												href={event.parcoursUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												{t.event.viewCourse}
											</Link>
										</p>
									</div>
								)}

								{event.registrationUrl != null && event.registrationUrl !== '' && (
									<div>
										<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.registration}</h3>
										<p className="text-muted-foreground">
											<Link
												className="text-primary underline"
												href={event.registrationUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												{t.event.goToRegistration}
											</Link>
										</p>
									</div>
								)}
							</div>

							{(event.bibPickupLocation != null ||
								event.bibPickupWindowBeginDate != null ||
								event.bibPickupWindowEndDate != null) && (
								<div className="mt-6 grid gap-6 md:grid-cols-2">
									<div>
										<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.bibPickup.title}</h3>
										{event.bibPickupLocation != null && event.bibPickupLocation !== '' && (
											<p className="text-muted-foreground">
												<span className="font-medium">{t.event.bibPickup.location}:</span> {event.bibPickupLocation}
											</p>
										)}
										{(event.bibPickupWindowBeginDate != null || event.bibPickupWindowEndDate != null) && (
											<p className="text-muted-foreground">
												<span className="font-medium">{t.event.bibPickup.window}:</span>{' '}
												{formatPbDate(event.bibPickupWindowBeginDate)}
												{event.bibPickupWindowEndDate != null && <> → {formatPbDate(event.bibPickupWindowEndDate)}</>}
											</p>
										)}
									</div>
									{event.transferDeadline != null && (
										<div>
											<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.transferDeadline}</h3>
											<p className="text-muted-foreground">{formatPbDate(event.transferDeadline)}</p>
										</div>
									)}
								</div>
							)}

							{event.description != null && event.description !== '' && (
								<div className="mt-6">
									<h3 className="text-foreground mb-2 text-lg font-semibold">{t.event.description}</h3>
									<p className="text-muted-foreground">{event.description}</p>
								</div>
							)}
						</div>
					</div>

					{/* Bibs Section */}
					<div className="dark:border-border/50 bg-card/80 rounded-3xl border border-black/50 p-8 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-sm">
						<h2 className="text-foreground mb-6 text-2xl font-bold">{t.event.bibs.title}</h2>

						{bibSales.length > 0 ? (
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
								{bibSales.map(bibSale => (
									<CardMarket key={bibSale.id} bibSale={bibSale} locale={locale} />
								))}
							</div>
						) : (
							<div className="py-8 text-center">
								<div className="mb-6 text-6xl opacity-50">📋</div>
								<h3 className="text-foreground mb-4 text-xl font-semibold">{t.event.bibs.noBibsAvailable}</h3>
								<p className="text-muted-foreground mb-6">{t.event.waitlist.joinDescription}</p>

								<SignedIn>
									<div className="mx-auto max-w-md space-y-3">
										<div className="flex items-center gap-2">
											<Bell className="h-5 w-5" />
											<span className="font-medium">{t.event.waitlist.joinButton}</span>
										</div>
										<WaitlistStatusClient
											eventId={eventId}
											action={handleJoinWaitlist}
											joinLabel={t.event.waitlist.joinButton}
											locale={locale}
										/>
									</div>
								</SignedIn>
								<SignedOut>
									{/* Non-authenticated user - email input or login options */}
									<div className="mx-auto max-w-md space-y-4">
										<form action={handleJoinWaitlist} className="space-y-4">
											<input name="eventId" type="hidden" value={eventId} />
											<div className="space-y-2">
												<label className="text-foreground block text-sm font-medium" htmlFor="waitlist-email">
													{t.event.waitlist.emailLabel}
												</label>
												<input
													className="border-border bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 backdrop-blur-sm transition focus:ring-2 focus:outline-none"
													id="waitlist-email"
													name="email"
													placeholder={t.event.waitlist.emailPlaceholder}
													required
													type="email"
												/>
											</div>
											<button
												className="bg-accent/20 hover:bg-accent/30 text-accent-foreground hover:text-foreground border-border flex w-full items-center justify-center gap-3 rounded-xl border px-6 py-3 font-medium backdrop-blur-md transition"
												type="submit"
											>
												<Bell className="h-5 w-5" />
												{t.event.waitlist.subscribeButton}
											</button>
										</form>
										<div className="relative">
											<div className="absolute inset-0 flex items-center">
												<div className="border-border w-full border-t" />
											</div>
											<div className="relative flex justify-center text-sm">
												<span className="text-muted-foreground bg-background px-2">{t.event.waitlist.or}</span>
											</div>
										</div>
										<Link
											className="bg-primary hover:bg-primary/90 text-primary-foreground flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3 font-medium transition"
											href={`/${locale}/sign-in`}
										>
											{t.event.waitlist.signInButton}
										</Link>
									</div>
								</SignedOut>
							</div>
						)}
					</div>

					{/* Back Button */}
					<div className="mt-8 text-center">
						<Link
							className="bg-accent/20 hover:bg-accent/30 text-accent-foreground hover:text-foreground border-border inline-flex items-center gap-3 rounded-xl border px-6 py-3 font-medium backdrop-blur-md transition"
							href={`/${locale}/events`}
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
	const { locale, id } = await params
	const event = await fetchEventById(id)

	if (!event) {
		return {
			title: 'Event Not Found',
			description: 'The requested event could not be found.',
		}
	}

	return generateEventMetadata(locale, event)
}
