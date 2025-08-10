'use client'

import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import CardMarketSimplified, { BibSaleSimplified } from '@/components/landing/CardMarketSimplified'
import { Locale } from '@/lib/i18n-config'

export const HeroAnimation = ({
	runs,
	locale,
	autoplay = true,
}: {
	autoplay?: boolean
	locale: Locale
	runs: BibSaleSimplified[]
}) => {
	const [active, setActive] = useState(0)
	const [isMounted, setIsMounted] = useState(false)
	const [randomRotations, setRandomRotations] = useState<number[]>([])

	const handleNext = () => {
		setActive(prev => (prev + 1) % runs.length)
	}

	const handlePrev = () => {
		setActive(prev => (prev - 1 + runs.length) % runs.length)
	}

	const isActive = (index: number) => {
		return index === active
	}

	// Generate random rotation for each card client-side only
	const generateRandomRotations = () => {
		return runs.map(() => Math.floor(Math.random() * 21) - 10)
	}

	const getRotationForIndex = (index: number) => {
		// Use random rotations if available, otherwise fall back to 0
		return randomRotations[index] ?? 0
	}

	useEffect(() => {
		setIsMounted(true)
		// Generate random rotations only on client-side
		setRandomRotations(generateRandomRotations())

		if (autoplay) {
			const interval = setInterval(handleNext, 5000)
			return () => clearInterval(interval)
		}
	}, [autoplay])

	// Don't render the animation on the server to prevent hydration mismatch
	if (!isMounted) {
		return (
			<div className="relative w-full pb-32 md:pb-40">
				<div className="relative h-116 w-full md:translate-x-1/3">
					<div className="absolute inset-0 origin-bottom">
						<CardMarketSimplified bibSaleSimplified={runs[0]} locale={locale} />
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="relative w-full pb-32 md:pb-40">
			<div>
				<div className="relative h-116 w-full translate-x-4 md:translate-x-1/3">
					<AnimatePresence>
						{runs.map((run, index) => (
							<motion.div
								animate={{
									zIndex: isActive(index) ? 40 : runs.length + 2 - index,
									z: isActive(index) ? 0 : -100,
									y: isActive(index) ? [0, -80, 0] : 0,
									scale: isActive(index) ? 1 : 0.95,
									rotate: isActive(index) ? 0 : getRotationForIndex(index),
								}}
								className="absolute inset-0 origin-bottom"
								exit={{
									z: 100,
									scale: 0.9,
									rotate: getRotationForIndex(index),
									opacity: 1,
								}}
								initial={{
									z: -100,
									scale: 0.9,
									rotate: getRotationForIndex(index),
									opacity: 1,
								}}
								key={run.id}
								transition={{
									ease: 'easeInOut',
									duration: 0.4,
								}}
							>
								<CardMarketSimplified bibSaleSimplified={run} locale={locale} />
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>
			<div className="absolute right-1/4 bottom-20 z-50">
				<div className="flex gap-4 pt-12 md:pt-0">
					<button
						className="group/button flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
						onClick={handlePrev}
					>
						<IconArrowLeft className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
					</button>
					<button
						className="group/button flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
						onClick={handleNext}
					>
						<IconArrowRight className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
					</button>
				</div>
			</div>
		</div>
	)
}
