'use client'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

import { Confetti, ConfettiRef } from '@/components/ui/confetti'
import { Card, CardContent } from '@/components/ui/card'
import { getTranslations } from '@/lib/i18n/dictionary'
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n/config'

import translations from './locales.json'

function SuccessIcon() {
	return (
		<motion.div
			initial={{ scale: 0, rotate: -45 }}
			animate={{ scale: 1, rotate: 0 }}
			transition={{ type: 'spring', stiffness: 300, delay: 0.2, damping: 20 }}
			className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/15 ring-8 ring-green-500/10"
		>
			<CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
		</motion.div>
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

function ProgressSteps({ steps }: ProgressBarProps) {
	return (
		<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
			<CardContent className="p-6">
				<div className="space-y-4">
					{steps.map((step, idx) => (
						<motion.div
							key={step.label}
							initial={{ x: -40, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ duration: 0.6, delay: 0.8 + idx * 0.2 }}
							className="flex items-center gap-4"
						>
							<motion.div
								className={`flex h-10 w-10 items-center justify-center rounded-full ${step.done ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}
								initial={{ scale: 0.7 }}
								animate={{ scale: 1 }}
								transition={{ type: 'spring', stiffness: 200, damping: 15 }}
							>
								{step.done ? <CheckCircle className="h-5 w-5" /> : <Package className="h-5 w-5" />}
							</motion.div>
							<div className="flex-1">
								<div className="text-foreground font-medium">{step.label}</div>
								<div className="text-muted-foreground text-sm">{step.description}</div>
							</div>
						</motion.div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

export default function PurchaseSuccessClient({ locale }: { locale: Locale }) {
	const t = getTranslations(locale, translations)
	const router = useRouter()
	const confettiRef = useRef<ConfettiRef>(null)

	const steps = t.success.steps.map((step: { label: string; description: string }, idx: number) => ({
		label: step.label,
		done: idx === 0,
		description: step.description,
	}))

	useEffect(() => {
		// First confetti burst
		const timer1 = setTimeout(() => {
			confettiRef.current?.fire({
				spread: 70,
				particleCount: 100,
				origin: { y: 0.6 },
				colors: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
			})
		}, 800)

		// Second confetti burst
		const timer2 = setTimeout(() => {
			confettiRef.current?.fire({
				spread: 60,
				particleCount: 50,
				origin: { y: 0.7, x: 0.2 },
				colors: ['#f59e0b', '#ef4444', '#8b5cf6'],
			})
		}, 1200)

		// Third confetti burst
		const timer3 = setTimeout(() => {
			confettiRef.current?.fire({
				spread: 60,
				particleCount: 50,
				origin: { y: 0.7, x: 0.8 },
				colors: ['#10b981', '#3b82f6', '#f59e0b'],
			})
		}, 1600)

		return () => {
			clearTimeout(timer1)
			clearTimeout(timer2)
			clearTimeout(timer3)
		}
	}, [])

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

			<Confetti
				ref={confettiRef}
				manualstart
				style={{
					zIndex: 9999,
					width: '100%',
					top: 0,
					position: 'absolute',
					pointerEvents: 'none',
					left: 0,
					height: '100%',
				}}
				options={{
					spread: 45,
					particleCount: 50,
					origin: { y: 0.7 },
				}}
			/>

			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ ease: 'easeOut', duration: 0.8 }}
				className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12"
			>
				<div className="container mx-auto max-w-2xl text-center">
					<motion.div
						animate={{
							y: [0, -10, 0],
							rotate: [0, 2, -2, 0],
						}}
						transition={{
							repeat: Infinity,
							ease: 'easeInOut',
							duration: 6,
							delay: 2,
						}}
					>
						<SuccessIcon />
					</motion.div>

					<motion.h1
						initial={{ y: -30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.3 }}
						className="text-foreground mb-4 text-4xl font-bold tracking-tight md:text-5xl"
					>
						{t.success.title}
					</motion.h1>

					<motion.p
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.5 }}
						className="text-muted-foreground mb-12 text-xl"
					>
						{t.success.thanks}
					</motion.p>

					<motion.div
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.7 }}
						className="mb-12"
					>
						<ProgressSteps steps={steps} />
					</motion.div>

					<motion.div
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.8, delay: 1.2 }}
						className="flex flex-col gap-4 sm:flex-row sm:justify-center"
					>
						<motion.div className="relative overflow-hidden">
							<motion.div
								className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
								initial={{ x: '-100%' }}
								animate={{ x: '200%' }}
								transition={{
									repeatDelay: 3,
									repeat: Infinity,
									ease: 'linear',
									duration: 2,
								}}
							/>
							<Button
								size="lg"
								className="relative z-10 gap-2"
								onClick={() => {
									confettiRef.current?.fire({
										spread: 80,
										particleCount: 80,
										origin: { y: 0.8 },
										colors: ['#10b981', '#f59e0b', '#3b82f6'],
									})
									router.push('/dashboard/buyer/')
								}}
							>
								<Package className="h-5 w-5" />
								{t.success.viewBibs}
							</Button>
						</motion.div>

						<motion.div>
							<Button variant="outline" size="lg" className="gap-2" onClick={() => router.push('/marketplace')}>
								{t.success.backMarketplace}
								<motion.div
									animate={{ x: [0, 4, 0] }}
									transition={{
										repeat: Infinity,
										ease: 'easeInOut',
										duration: 2,
									}}
								>
									<ArrowRight className="h-4 w-4" />
								</motion.div>
							</Button>
						</motion.div>
					</motion.div>
				</div>
			</motion.div>
		</div>
	)
}
