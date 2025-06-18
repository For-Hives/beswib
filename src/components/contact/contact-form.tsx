'use client'

import { Loader2, Send } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import type React from 'react'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ContactFormProps {
	t: {
		form: {
			messageResponse: string
			messageSent: string
			sendAnotherMessage: string
			sending: string
			sendMessage: string
			yourEmail: string
			yourEmailPlaceholder: string
			yourMessage: string
			yourMessagePlaceholder: string
			yourName: string
			yourNamePlaceholder: string
		}
	}
}

export default function ContactForm({ t }: ContactFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		// Simulate form submission
		setTimeout(() => {
			setIsSubmitting(false)
			setIsSubmitted(true)
		}, 1500)
	}

	if (isSubmitted) {
		return (
			<motion.div
				animate={{ y: 0, opacity: 1 }}
				className="flex h-full flex-col items-center justify-center p-6 text-center"
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
				<p className="text-slate-600 dark:text-slate-300">{t.form.messageResponse}</p>
				<Button className="mt-4" onClick={() => setIsSubmitted(false)} variant="outline">
					{t.form.sendAnotherMessage}
				</Button>
			</motion.div>
		)
	}

	return (
		<form className="h-full space-y-4" onSubmit={handleSubmit}>
			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="name">
					{t.form.yourName}
				</label>
				<Input
					className="border-violet-600/60 bg-white/50 ring-2 ring-violet-600/40 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50"
					id="name"
					placeholder={t.form.yourNamePlaceholder}
					required
				/>
			</div>
			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
					{t.form.yourEmail}
				</label>
				<Input
					className="border-violet-600/60 bg-white/50 ring-2 ring-violet-600/40 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50 dark:focus:ring-slate-700"
					id="email"
					placeholder={t.form.yourEmailPlaceholder}
					required
					type="email"
				/>
			</div>
			<div className="flex-1">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="message">
					{t.form.yourMessage}
				</label>
				<Textarea
					className="h-[120px] resize-none border-violet-600/60 bg-white/50 ring-2 ring-violet-600/40 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50"
					id="message"
					placeholder={t.form.yourMessagePlaceholder}
					required
				/>
			</div>
			<Button
				className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
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
