'use client'

import { useQueryState } from 'nuqs'
import Link from 'next/link'

interface WaitlistNotificationsProps {
	eventId: string
	eventName: string
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

export function WaitlistNotifications({ t, eventName, eventId }: WaitlistNotificationsProps) {
	const [waitlistSuccess] = useQueryState('waitlist_success')
	const [waitlistError] = useQueryState('waitlist_error')
	const [subscribedEmail] = useQueryState('email')

	const isWaitlistSuccess = waitlistSuccess === 'true'

	if (!isWaitlistSuccess && (waitlistError == null || waitlistError === '')) {
		return null
	}

	return (
		<>
			{/* Success Modal-like Notification */}
			{isWaitlistSuccess && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-green-600 dark:text-green-400">{t.event.waitlist.success.icon}</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">{t.event.waitlist.success.title}</h1>
						<p className="text-muted-foreground mb-6 text-lg">
							{subscribedEmail != null && subscribedEmail !== ''
								? `Great! You'll receive notifications at ${subscribedEmail} when bibs become available for ${eventName}.`
								: t.event.waitlist.success.message.replace('{eventName}', eventName)}
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
			{waitlistError != null && waitlistError !== '' && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-red-500/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--destructive)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--destructive)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-red-600 dark:text-red-400">{t.event.waitlist.error.icon}</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">{t.event.waitlist.error.title}</h1>
						<p className="text-muted-foreground mb-6 text-lg">
							{waitlistError === 'already_added'
								? t.event.waitlist.error.alreadyAdded.replace('{eventName}', eventName)
								: waitlistError === 'already_added_email'
									? 'You have already subscribed to notifications for this event with this email address.'
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
		</>
	)
}
