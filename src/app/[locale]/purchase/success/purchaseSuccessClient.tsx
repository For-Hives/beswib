'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getTranslations } from '@/lib/getDictionary'
import translations from './locales.json'
import { Locale } from '@/lib/i18n-config'

function SuccessSVG() {
	// Animated checkmark with sparkles
	return (
		<motion.svg
			initial={{ scale: 0, rotate: -45 }}
			animate={{ scale: 1, rotate: 0 }}
			transition={{ type: 'spring', stiffness: 300, damping: 20 }}
			width="120"
			height="120"
			viewBox="0 0 120 120"
			fill="none"
			className="mx-auto mb-6"
		>
			<circle cx="60" cy="60" r="56" stroke="#4ade80" strokeWidth="8" fill="#222" />
			<motion.path
				d="M40 65L55 80L80 50"
				stroke="#4ade80"
				strokeWidth="8"
				strokeLinecap="round"
				strokeLinejoin="round"
				initial={{ pathLength: 0 }}
				animate={{ pathLength: 1 }}
				transition={{ duration: 1.2, ease: 'easeInOut' }}
			/>
			{/* Sparkles */}
			<motion.circle
				cx="30"
				cy="30"
				r="4"
				fill="#fff"
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 1.2, duration: 0.5 }}
			/>
			<motion.circle
				cx="90"
				cy="40"
				r="3"
				fill="#fff"
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 1.4, duration: 0.5 }}
			/>
			<motion.circle
				cx="70"
				cy="100"
				r="2.5"
				fill="#fff"
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 1.6, duration: 0.5 }}
			/>
		</motion.svg>
	)
}

type Step = {
	label: string
	description: string
	done: boolean
}

interface ProgressBarProps {
	steps: Step[]
}

function ProgressBar({ steps }: ProgressBarProps) {
	return (
		<div className="mt-8 mb-10 flex flex-col gap-6">
			{steps.map((step, idx) => (
				<motion.div
					key={step.label}
					initial={{ opacity: 0, x: -40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.3 + idx * 0.2, duration: 0.6 }}
					className="flex items-center gap-4"
				>
					<motion.div
						className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step.done ? 'border-green-400 bg-green-500' : 'bg-card/80 border-card/60'}`}
						initial={{ scale: 0.7 }}
						animate={{ scale: 1 }}
						transition={{ type: 'spring', stiffness: 200, damping: 15 }}
					>
						{step.done ? (
							<motion.svg width="20" height="20" viewBox="0 0 20 20">
								<motion.path
									d="M5 10L9 14L15 7"
									stroke="#fff"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
									initial={{ pathLength: 0 }}
									animate={{ pathLength: 1 }}
									transition={{ duration: 0.7 }}
								/>
							</motion.svg>
						) : (
							<motion.div className="h-3 w-3 animate-pulse rounded-full bg-white/30" />
						)}
					</motion.div>
					<div>
						<div className="text-base font-semibold text-white">{step.label}</div>
						<div className="text-sm text-white/60">{step.description}</div>
					</div>
				</motion.div>
			))}
		</div>
	)
}

export default function PurchaseSuccessClient({ locale }: { locale: Locale }) {
	const t = getTranslations(locale, translations)

	const router = useRouter()

	const steps = t.success.steps.map((step: { label: string; description: string }, idx: number) => ({
		label: step.label,
		description: step.description,
		done: idx === 0, // Only first step is done
	}))

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.7, ease: 'easeOut' }}
			className="bg-card/100 flex min-h-[80vh] flex-col items-center justify-center px-8 py-10 font-sans leading-relaxed text-white"
			style={{
				background: 'radial-gradient(ellipse at top left, #23272a 80%, #18181b 100%)',
				fontFamily: 'var(--font-sans, sans-serif)',
			}}
		>
			<SuccessSVG />
			<motion.h1
				initial={{ y: -30, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.2, duration: 0.7 }}
				className="mb-2 text-3xl font-bold tracking-tight"
			>
				{t.success.title}
			</motion.h1>
			<motion.p
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.4, duration: 0.7 }}
				className="mb-6 text-lg text-white/80"
			>
				{t.success.thanks}
			</motion.p>
			<ProgressBar steps={steps} />
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1.2, duration: 0.7 }}
				className="mt-8 flex gap-6"
			>
				<motion.button
					whileHover={{ scale: 1.08, boxShadow: '0 0 16px #4ade80' }}
					whileTap={{ scale: 0.97 }}
					className="rounded-lg bg-green-500 px-7 py-3 text-base font-medium text-white shadow-lg shadow-black/30 transition-all"
					onClick={() => router.push('/dashboard/buyer/')}
				>
					{t.success.viewBibs}
				</motion.button>
				<motion.button
					whileHover={{ scale: 1.08, boxShadow: '0 0 16px #38bdf8' }}
					whileTap={{ scale: 0.97 }}
					className="bg-card/80 rounded-lg border border-white/10 px-7 py-3 text-base font-medium text-white shadow-lg shadow-black/30 transition-all"
					onClick={() => router.push('/marketplace')}
				>
					{t.success.backMarketplace}
				</motion.button>
			</motion.div>
			{/* Glitter effect overlay */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.5 }}
				transition={{ delay: 1.5, duration: 1 }}
				className="pointer-events-none absolute inset-0 z-0"
				style={{
					background:
						'url("/public/landing/background.jpg") center/cover, repeating-radial-gradient(circle, #fff2 0px, #fff0 2px, #fff2 4px)',
				}}
			/>
		</motion.div>
	)
}
