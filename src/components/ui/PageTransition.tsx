'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

// Fade + Scale variants for a subtle wow effect
const variants = {
	initial: {
		scale: 0.96,
		opacity: 0,
		filter: 'blur(8px)',
	},
	exit: {
		transition: {
			scale: { duration: 0.32 },
			opacity: { duration: 0.32 },
		},
		scale: 1.04,
		opacity: 0,
		filter: 'blur(8px)',
	},
	animate: {
		transition: {
			stiffness: 420,
			scale: { duration: 0.48 },
			opacity: { duration: 0.38 },
			mass: 0.9,
			damping: 38,
		},
		scale: 1,
		opacity: 1,
		filter: 'blur(0px)',
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
				style={{ width: '100%', minHeight: '100vh' }}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	)
}
