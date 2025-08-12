'use client'

import { Loader2, Send } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import type React from 'react'
import { toast } from 'sonner'

import globalTranslations from '@/components/global/locales.json'
import { Textarea } from '@/components/ui/textareaAlt'
import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'

interface ContactFormProps {
	t: (typeof globalTranslations)['en']['contact']
}

export default function ContactForm({ t }: ContactFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (isSubmitting) return
		setIsSubmitting(true)
		try {
			const { submitContactMessage } = await import('@/app/[locale]/contact/actions')
			const res = await submitContactMessage({ name, email, message })
			if (res.success) {
				toast.success(t.form.messageSent)
				setIsSubmitted(true)
				setName('')
				setEmail('')
				setMessage('')
			} else {
				// Soft error handling; keep the user on the form
				console.error('Contact submit failed:', res.error)
				toast.error(res.error ?? 'Failed to send message')
			}
		} catch (err) {
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
		<form className="mt-4 h-full space-y-4" onSubmit={handleSubmit}>
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
