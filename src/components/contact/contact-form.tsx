'use client'

import { Loader2, Send } from 'lucide-react'
import { motion } from 'motion/react'
import { useSearchParams } from 'next/navigation'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import type globalTranslations from '@/components/global/locales.json'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/inputAlt'
import { Textarea } from '@/components/ui/textareaAlt'
import { track } from '@/lib/analytics/client'

interface ContactFormProps {
	t: (typeof globalTranslations)['en']['contact']
}

export default function ContactForm({ t }: ContactFormProps) {
	const searchParams = useSearchParams()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')
	// Analytics only: whether the URL hand-off filled a field, and whether contact_form_start was sent
	const prefilledRef = useRef(false)
	const startedRef = useRef(false)

	// Pre-fill form with URL parameters
	useEffect(() => {
		const nameParam = searchParams.get('name')
		const emailParam = searchParams.get('email')
		const messageParam = searchParams.get('message')

		if (nameParam != null && nameParam !== '') setName(decodeURIComponent(nameParam))
		if (emailParam != null && emailParam !== '') setEmail(decodeURIComponent(emailParam))
		if (messageParam != null && messageParam !== '') setMessage(decodeURIComponent(messageParam))
		if (nameParam || emailParam || messageParam) prefilledRef.current = true
	}, [searchParams])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (isSubmitting) return
		track('contact_form_submit', { prefilled: prefilledRef.current })
		setIsSubmitting(true)
		try {
			const { submitContactMessage } = await import('@/app/[locale]/contact/actions')
			const res = await submitContactMessage({ name, message, email })
			if (res.success) {
				track('contact_form_success', { prefilled: prefilledRef.current })
				toast.success(t.form.messageSent)
				setIsSubmitted(true)
				setName('')
				setEmail('')
				setMessage('')
				// The fields were just emptied: a second message is no longer the URL hand-off
				prefilledRef.current = false
			} else {
				track('contact_form_error', { kind: res.code ?? 'exception', prefilled: prefilledRef.current })
				// Soft error handling; keep the user on the form
				console.error('Contact submit failed:', res.error)
				toast.error(res.error ?? 'Failed to send message')
			}
		} catch (err) {
			track('contact_form_error', { kind: 'exception', prefilled: prefilledRef.current })
			console.error('Contact submit error:', err)
			toast.error('Failed to send message')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isSubmitted) {
		return (
			<motion.div
				animate={{ y: 0, opacity: 1 }}
				className="flex h-full flex-col items-center justify-center text-center"
				initial={{ y: 10, opacity: 0 }}
			>
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
					<svg
						className="h-8 w-8 text-green-600 dark:text-green-300"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
					</svg>
				</div>
				<h3 className="mb-2 text-xl font-bold">{t.form.messageSent}</h3>
				<p className="text-muted-foreground dark:text-slate-300">{t.form.messageResponse}</p>
				<Button className="mt-4" onClick={() => setIsSubmitted(false)} variant="outline">
					{t.form.sendAnotherMessage}
				</Button>
			</motion.div>
		)
	}

	return (
		<form
			className="mt-4 h-full space-y-4"
			onFocusCapture={() => {
				if (startedRef.current) return
				startedRef.current = true
				track('contact_form_start', { prefilled: prefilledRef.current })
			}}
			onSubmit={e => void handleSubmit(e)}
		>
			<div>
				<label className="text-foreground mb-1 block text-sm font-medium dark:text-gray-300" htmlFor="name">
					{t.form.yourName}
				</label>
				<Input
					className="backdrop-blur-sm dark:border-stone-700 dark:bg-stone-800/50"
					id="name"
					placeholder={t.form.yourNamePlaceholder}
					value={name}
					onChange={e => setName(e.currentTarget.value)}
					required
				/>
			</div>
			<div>
				<label className="text-foreground mb-1 block text-sm font-medium dark:text-gray-300" htmlFor="email">
					{t.form.yourEmail}
				</label>
				<Input
					className="backdrop-blur-sm dark:border-stone-700 dark:bg-stone-800/50 dark:focus:ring-slate-700"
					id="email"
					placeholder={t.form.yourEmailPlaceholder}
					required
					type="email"
					value={email}
					onChange={e => setEmail(e.currentTarget.value)}
				/>
			</div>
			<div className="flex-1">
				<label className="text-foreground block text-sm font-medium dark:text-gray-300" htmlFor="message">
					{t.form.yourMessage}
				</label>
				<Textarea
					className="h-[120px] resize-none backdrop-blur-sm dark:border-stone-700 dark:bg-stone-800/50"
					id="message"
					placeholder={t.form.yourMessagePlaceholder}
					value={message}
					onChange={e => setMessage(e.currentTarget.value)}
					required
				/>
			</div>
			<Button
				className="from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-primary-foreground w-full cursor-pointer bg-gradient-to-r"
				disabled={isSubmitting}
				type="submit"
			>
				{isSubmitting ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						{t.form.sending}
					</>
				) : (
					<>
						<Send className="mr-2 h-4 w-4" />
						{t.form.sendMessage}
					</>
				)}
			</Button>
		</form>
	)
}
