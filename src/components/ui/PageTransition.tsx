'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

// Fade + Scale variants for a subtle wow effect
const variants = {
	initial: {
		opacity: 0,
		scale: 0.96,
		filter: 'blur(8px)',
	},
	animate: {
		opacity: 1,
		scale: 1,
		filter: 'blur(0px)',
		transition: {
			stiffness: 420,
			damping: 38,
			mass: 0.9,
			opacity: { duration: 0.38 },
			scale: { duration: 0.48 },
		},
	},
	exit: {
		opacity: 0,
		scale: 1.04,
		filter: 'blur(8px)',
		transition: {
			opacity: { duration: 0.32 },
			scale: { duration: 0.32 },
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
