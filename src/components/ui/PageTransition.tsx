'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

// Bouncy compress/expand variants
const variants = {
	initial: {
		y: '-100%',
		scaleY: 0.8,
		opacity: 0,
	},
	animate: {
		y: '0%',
		scaleY: 1,
		opacity: 1,
		transition: {
			bounce: 0.6,
			duration: 0.7,
		},
	},
	exit: {
		y: '100%',
		scaleY: 0.8,
		opacity: 0,
		transition: {
			bounce: 0.4,
			duration: 0.5,
		},
	},
}

export default function PageTransition({ children }: { children: ReactNode }) {
	const pathname = usePathname()
	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={pathname}
				variants={variants}
				initial="initial"
				animate="animate"
				exit="exit"
				style={{ minHeight: '100vh', width: '100%' }}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	)
}
