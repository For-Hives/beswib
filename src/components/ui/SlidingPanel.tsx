'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type React from 'react'
import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

interface SlidingPanelProps {
	children: React.ReactNode
	className?: string
	isOpen: boolean
	onClose: () => void
	title?: string
	variant?: 'modal' | 'slide'
}

export function SlidingPanel({
	variant = 'slide',
	title,
	onClose,
	isOpen,
	className,
	children,
}: Readonly<SlidingPanelProps>) {
	const panelRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		const handlePreventScroll = (event: Event) => {
			event.preventDefault()
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)

			// Calculate scrollbar width to prevent layout shift
			const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth

			// Prevent body scrolling when modal is open
			document.body.style.overflow = 'hidden'
			document.body.style.paddingRight = `${scrollBarWidth}px`

			// Additional scroll prevention for wheel, touch, and keyboard events
			document.addEventListener('wheel', handlePreventScroll, { passive: false })
			document.addEventListener('touchmove', handlePreventScroll, { passive: false })
			document.addEventListener(
				'keydown',
				e => {
					// Prevent arrow keys, page up/down, home/end from scrolling
					if (['ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', 'Space'].includes(e.code)) {
						if (e.target === document.body || panelRef.current?.contains(e.target as Node) !== true) {
							e.preventDefault()
						}
					}
				},
				{ passive: false }
			)
		} else {
			document.removeEventListener('keydown', handleEscape)
			document.body.style.overflow = ''
			document.body.style.paddingRight = ''
			document.removeEventListener('wheel', handlePreventScroll)
			document.removeEventListener('touchmove', handlePreventScroll)
		}

		return () => {
			document.removeEventListener('keydown', handleEscape)
			document.body.style.overflow = ''
			document.body.style.paddingRight = ''
			document.removeEventListener('wheel', handlePreventScroll)
			document.removeEventListener('touchmove', handlePreventScroll)
		}
	}, [isOpen, onClose])

	const isModal = variant === 'modal'

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					animate={{ opacity: 1 }}
					className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					onClick={onClose}
				>
					<motion.div
						animate={isModal ? { scale: 1, opacity: 1 } : { x: 0 }}
						className={cn(
							isModal
								? 'bg-card border-border/20 fixed top-1/2 left-1/2 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border p-6 shadow-2xl'
								: 'bg-card fixed top-0 right-0 h-full w-[80vw] overflow-y-auto p-6 shadow-lg',
							className
						)}
						exit={isModal ? { scale: 0.95, opacity: 0 } : { x: '100%' }}
						initial={isModal ? { scale: 0.95, opacity: 0 } : { x: '100%' }}
						onClick={e => e.stopPropagation()} // Prevent closing when clicking inside panel
						ref={panelRef}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					>
						<div className="mb-6 flex items-center justify-between">
							{Boolean(title) && <h2 className="text-foreground text-xl font-semibold">{title}</h2>}
							<button
								type="button"
								aria-label="Close panel"
								className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full p-1 transition-colors"
								onClick={onClose}
							>
								<svg
									className="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
								</svg>
							</button>
						</div>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
