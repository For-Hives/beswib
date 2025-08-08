'use client'

import { ArrowRight, Facebook, Handshake, Instagram, Mail, MessageCircle, Twitter, Users, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import type React from 'react'

import globalTranslations from '@/components/global/locales.json'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SOCIALS } from '@/lib/socials'

type BentoCardProps = Readonly<{
	className?: string
	content: string
	hoverEffect: 'float' | 'glow' | 'pulse'
	href: string
	icon: React.ReactNode
	ctaLabel: string

	isActive: boolean
	onMouseEnter: () => void
	onMouseLeave: () => void
	title: string
}>

import Link from 'next/link'

import ContactForm from './contact-form'

type Props = {
	t: Translations
}

type Translations = (typeof globalTranslations)['en']['contact']

export default function BentoGrid({ t }: Readonly<Props>) {
	const [activeCard, setActiveCard] = useState<null | string>(null)

	const handleMouseEnter = (id: string) => {
		setActiveCard(id)
	}

	const handleMouseLeave = () => {
		setActiveCard(null)
	}

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-6">
			{/* Information card - spans full width ℹ️ */}
			<motion.div
				animate={{ y: 0, opacity: 1 }}
				className="bg-foreground/5 hover:border-primary/50 relative col-span-1 overflow-hidden rounded-3xl border p-8 shadow-xl transition-colors md:col-span-6"
				initial={{ y: 20, opacity: 0 }}
			>
				<div className="relative z-10">
					<h1 className="dark:text-primary-foreground mb-6 text-4xl font-bold">{t.discussTogether}</h1>
					<p className="dark:text-primary-foreground/80 mb-8">{t.useContactForm}</p>

					<div className="mb-2">
						<p className="dark:text-primary-foreground/80 mb-4">{t.runnerOrganizer}</p>

						<div className="flex justify-between space-x-4">
							<div>
								<p className="dark:text-primary-foreground/80">{t.ourTeamResponds}</p>
								<ul className="dark:text-primary-foreground/80 mt-2 list-inside list-disc space-y-1">
									<li>{t.understandPlatform}</li>
									<li>{t.sellBibNotListed}</li>
									<li>{t.organizerAuthorize}</li>
									<li>{t.discussPartnership}</li>
								</ul>
								<p className="text-primary-foreground/80 mt-4">{t.fillFormResponse}</p>
							</div>
							<div className="flex w-1/3 items-center justify-center">
								<div className="bg-primary-foreground/10 rounded-full p-4 backdrop-blur-sm">
									<MessageCircle className="text-primary-foreground h-16 w-16 p-2" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Background decoration 🎨 */}
				<div className="via-primary/30 absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent to-transparent"></div>
				<div className="from-primary/25 absolute top-0 right-0 h-40 w-40 rounded-bl-full bg-gradient-to-bl to-transparent"></div>
				<div className="from-primary/10 absolute bottom-0 left-0 h-32 w-32 rounded-tr-full bg-gradient-to-tr to-transparent"></div>
			</motion.div>

			{/* Main contact form - spans 2 rows 📝 */}
			<motion.div
				animate={{ y: 0, opacity: 1 }}
				className="bg-card border-border hover:border-primary/50 relative col-span-1 row-span-2 overflow-hidden rounded-3xl border shadow-xl transition-colors md:col-span-4"
				initial={{ y: 20, opacity: 0 }}
				transition={{ delay: 0.1 }}
			>
				<div className="via-primary/30 absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent to-transparent"></div>
				<div className="h-full p-8">
					<h2 className="text-card-foreground text-2xl font-bold">{t.getInTouch}</h2>
					<ContactForm t={t} />
				</div>
				<div className="from-primary/25 via-primary/5 pointer-events-none absolute right-0 bottom-0 h-45 w-45 rounded-tl-full bg-gradient-to-tl to-transparent"></div>
			</motion.div>

			{/* Email card with hover effect 📧 */}
			<BentoCard
				className="bg-card border-border hover:border-primary/50 col-span-1 border transition-colors md:col-span-2"
				content="contact@beswib.com"
				hoverEffect="glow"
				href="mailto:contact@beswib.com"
				icon={<Mail className="h-6 w-6" />}
				ctaLabel={t.contactCta}
				isActive={activeCard === 'email'}
				onMouseEnter={() => handleMouseEnter('email')}
				onMouseLeave={handleMouseLeave}
				title={t.email}
			/>

			{/* Support card with hover effect 🤝 */}
			<BentoCard
				className="bg-card border-border hover:border-primary/50 col-span-1 border transition-colors md:col-span-2"
				content="support@beswib.com"
				hoverEffect="float"
				href="mailto:support@beswib.com"
				icon={<Users className="h-6 w-6" />}
				ctaLabel={t.contactCta}
				isActive={activeCard === 'support'}
				onMouseEnter={() => handleMouseEnter('support')}
				onMouseLeave={handleMouseLeave}
				title={t.support}
			/>

			{/* Interactive element 🖱️ */}
			<motion.div
				animate={{ y: 0, opacity: 1 }}
				className="border-border bg-card hover:border-primary/50 relative col-span-1 flex cursor-pointer flex-col items-start justify-start overflow-hidden rounded-3xl border px-6 py-6 text-center shadow-xl transition-colors"
				initial={{ y: 20, opacity: 0 }}
			>
				<Link className="h-full w-full" href={SOCIALS.twitter} rel="noopener noreferrer" target="_blank">
					<div className="via-primary/30 absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent to-transparent"></div>

					<div className="grid h-full w-full grid-cols-1 items-center justify-center gap-2">
						<div className="z-20 flex cursor-pointer items-center justify-center transition-all duration-300 hover:scale-110">
							<Twitter className="text-foreground h-8 w-8" />
						</div>
					</div>
					<div className="bg-primary/10 absolute -right-8 -bottom-8 h-24 w-24 rounded-full blur-xl"></div>
				</Link>
			</motion.div>
			<motion.div
				animate={{ y: 0, opacity: 1 }}
				className="border-border bg-card hover:border-primary/50 relative col-span-1 flex cursor-pointer flex-col items-start justify-start overflow-hidden rounded-3xl border px-6 py-6 text-center shadow-xl transition-colors"
				initial={{ y: 20, opacity: 0 }}
			>
				<Link className="h-full w-full" href={SOCIALS.facebook} rel="noopener noreferrer" target="_blank">
					<div className="via-primary/30 absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent to-transparent"></div>

					<div className="grid h-full w-full grid-cols-1 items-center justify-center gap-2">
						<div className="z-20 flex cursor-pointer items-center justify-center transition-all duration-300 hover:scale-110">
							<Facebook className="text-foreground h-8 w-8" />
						</div>
					</div>
					<div className="bg-primary/10 absolute -right-8 -bottom-8 h-24 w-24 rounded-full blur-xl"></div>
				</Link>
			</motion.div>
			<motion.div
				animate={{ y: 0, opacity: 1 }}
				className="border-border bg-card hover:border-primary/50 relative col-span-1 flex cursor-pointer flex-col items-start justify-start overflow-hidden rounded-3xl border px-6 py-6 text-center shadow-xl transition-colors"
				initial={{ y: 20, opacity: 0 }}
			>
				<Link className="h-full w-full" href={SOCIALS.instagram} rel="noopener noreferrer" target="_blank">
					<div className="via-primary/30 absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent to-transparent"></div>

					<div className="grid h-full w-full grid-cols-1 items-center justify-center gap-2">
						<div className="z-20 flex cursor-pointer items-center justify-center transition-all duration-300 hover:scale-110">
							<Instagram className="text-foreground h-8 w-8" />
						</div>
					</div>
					<div className="bg-primary/10 absolute -right-8 -bottom-8 h-24 w-24 rounded-full blur-xl"></div>
				</Link>
			</motion.div>

			<motion.div
				animate={{ y: 0, opacity: 1 }}
				className="border-border bg-card hover:border-primary/50 relative col-span-1 flex cursor-pointer flex-col items-start justify-start overflow-hidden rounded-3xl border px-6 py-6 text-center shadow-xl transition-colors"
				initial={{ y: 20, opacity: 0 }}
			>
				<Link className="h-full w-full" href={SOCIALS.x} rel="noopener noreferrer" target="_blank">
					<div className="via-primary/30 absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent to-transparent"></div>

					<div className="grid h-full w-full grid-cols-1 items-center justify-center gap-2">
						<div className="z-20 flex cursor-pointer items-center justify-center transition-all duration-300 hover:scale-110">
							<X className="text-foreground h-8 w-8" />
						</div>
					</div>
					<div className="bg-primary/10 absolute -right-8 -bottom-8 h-24 w-24 rounded-full blur-xl"></div>
				</Link>
			</motion.div>

			{/* Partnerships card with hover effect 💼 */}
			<BentoCard
				className="bg-card border-border hover:border-primary/50 col-span-1 border transition-colors md:col-span-2"
				content="partners@beswib.com"
				hoverEffect="glow"
				href="mailto:partners@beswib.com"
				icon={<Handshake className="h-6 w-6" />}
				ctaLabel={t.partnerships}
				isActive={activeCard === 'partnerships'}
				onMouseEnter={() => handleMouseEnter('partnerships')}
				onMouseLeave={handleMouseLeave}
				title={t.partnerships}
			/>
		</div>
	)
}

function BentoCard({
	title,
	onMouseLeave,
	onMouseEnter,
	isActive,
	icon,
	href,
	hoverEffect,
	content,
	className,
	ctaLabel,
}: BentoCardProps) {
	return (
		<motion.a
			animate={{ y: 0, opacity: 1 }}
			className={cn(
				'relative col-span-1 flex flex-col items-start justify-between overflow-hidden rounded-3xl p-6 shadow-xl',
				className
			)}
			href={href}
			initial={{ y: 20, opacity: 0 }}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<div className="z-10">
				<div className="bg-foreground/10 text-foreground mb-4 inline-block rounded-xl p-3">{icon}</div>
				<h3 className="text-card-foreground mb-1 text-lg font-semibold">{title}</h3>
				<p className="text-muted-foreground">{content}</p>
			</div>
			<Button className="group mt-4" size="sm" variant="ghost">
				{ctaLabel}
				<ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
			</Button>

			{/* Dynamic background effects based on hover state ✨ */}
			{hoverEffect === 'glow' && isActive && (
				<div className="bg-primary/5 absolute inset-0 transition-opacity duration-300"></div>
			)}
			{hoverEffect === 'float' && (
				<div
					className={cn(
						'absolute right-0 bottom-0 h-32 w-32 rounded-full transition-all duration-500',
						isActive ? 'bg-primary/10 scale-125' : 'bg-accent/20'
					)}
				></div>
			)}
			{hoverEffect === 'pulse' && isActive && (
				<motion.div
					animate={{ opacity: [0.5, 0.2, 0.5] }}
					className="bg-primary/5 absolute inset-0"
					transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
				></motion.div>
			)}
			<div className="via-primary/30 absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent to-transparent"></div>
		</motion.a>
	)
}
