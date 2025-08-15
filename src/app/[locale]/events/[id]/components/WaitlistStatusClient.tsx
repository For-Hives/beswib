'use client'

import { useEffect, useState } from 'react'

interface Props {
	joinLabel: string
	eventId: string
	action: (formData: FormData) => Promise<void>
}

export default function WaitlistStatusClient({ joinLabel, eventId, action }: Props) {
	const [inWaitlist, setInWaitlist] = useState<boolean | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let active = true
		async function run(): Promise<void> {
			try {
				const res = await fetch(`/api/waitlist/status?eventId=${encodeURIComponent(eventId)}`, { cache: 'no-store' })
				if (!res.ok) {
					if (res.status === 401) {
						setInWaitlist(false)
						return
					}
					const data = (await res.json().catch(() => ({}))) as { error?: string }
					throw new Error(data?.error ?? 'request_failed')
				}
				const data = (await res.json()) as { inWaitlist: boolean }
				if (!active) return
				setInWaitlist(data.inWaitlist)
			} catch (e: unknown) {
				if (!active) return
				let msg: string | undefined
				if (typeof e === 'object' && e != null && 'message' in e) {
					msg = (e as { message?: string }).message
				}
				setError(msg ?? 'unknown_error')
			}
		}
		void run()
		return () => {
			active = false
		}
	}, [eventId])

	if (error != null && error !== '') {
		return <p className="text-destructive text-sm">Failed to check waitlist status.</p>
	}

	if (inWaitlist === null) {
		return <p className="text-muted-foreground text-sm">Checking waitlist status…</p>
	}

	if (inWaitlist) {
		return <p className="text-sm text-green-600 dark:text-green-400">You’re already on the waitlist for this event.</p>
	}

	return (
		<form action={action} className="mx-auto max-w-xs">
			<input name="eventId" type="hidden" value={eventId} />
			<button
				className="bg-accent/20 hover:bg-accent/30 text-accent-foreground hover:text-foreground border-border flex w-full items-center justify-center gap-3 rounded-xl border px-6 py-3 font-medium backdrop-blur-md transition"
				type="submit"
			>
				{/* Icon is up to parent; keep label only to stay generic */}
				{joinLabel}
			</button>
		</form>
	)
}
