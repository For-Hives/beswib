'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface Feature {
	content: string
	image: string
	step: string
	title?: string
}

interface FeatureStepsProps {
	autoPlayInterval?: number
	className?: string
	features: Feature[]
	imageHeight?: string
	title?: string
}

export function FeatureSteps({ features, className, autoPlayInterval = 100 }: FeatureStepsProps) {
	const [currentFeature, setCurrentFeature] = useState(0)
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		const timer = setInterval(() => {
			if (progress < 100) {
				setProgress(prev => prev + 100 / (autoPlayInterval / 100))
			} else {
				setCurrentFeature(prev => (prev + 1) % features.length)
				setProgress(0)
			}
		}, 100)

		return () => clearInterval(timer)
	}, [progress, features.length, autoPlayInterval])

	return (
		<div className={cn('py-12', className)}>
			<div className="mx-auto w-full max-w-7xl">
				<div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
					<div className="order-2 space-y-8 md:order-1">
						{features.map((feature, index) => (
							<motion.div
								animate={{ opacity: index === currentFeature ? 1 : 0.3 }}
								className="flex cursor-pointer items-center gap-6 md:gap-8"
								initial={{ opacity: 0.3 }}
								key={feature.step}
								onClick={() => {
									setCurrentFeature(index)
									setProgress(0)
								}}
								transition={{ duration: 0.5 }}
							>
								<motion.div
									className={cn(
										'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 md:h-10 md:w-10',
										index === currentFeature
											? 'bg-primary border-primary text-primary-foreground scale-110'
											: 'bg-muted border-muted-foreground'
									)}
									layout
								>
									{index <= currentFeature ? (
										<span className="text-sm font-bold">✓</span>
									) : (
										<span className="text-sm font-semibold">{index + 1}</span>
									)}
								</motion.div>

								<div className="min-w-0 flex-1">
									<h3 className="text-foreground mb-1 text-lg font-semibold md:text-xl">
										{feature.title ?? feature.step}
									</h3>
									<p className="text-muted-foreground text-sm leading-relaxed md:text-base">{feature.content}</p>
								</div>
							</motion.div>
						))}
					</div>

					<div
						className={cn(
							'bg-muted/50 relative order-1 h-[250px] overflow-hidden rounded-lg border md:order-2 md:h-[350px] lg:h-[450px]'
						)}
					>
						<AnimatePresence>
							{features.map(
								(feature, index) =>
									index === currentFeature && (
										<motion.div
											animate={{ opacity: 1 }}
											className="absolute inset-0 overflow-hidden rounded-lg"
											exit={{ opacity: 0 }}
											initial={{ opacity: 0 }}
											key={feature.step}
											transition={{ ease: 'easeInOut', duration: 0.4 }}
										>
											<Image
												alt={feature.step}
												className="h-full w-full object-cover"
												height={600}
												quality={90}
												src={feature.image}
												width={800}
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
										</motion.div>
									)
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	)
}
