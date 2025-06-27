'use client'

import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import React from 'react'

import { cn } from '@/lib/utils'

/**
 * This is a textarea component that has a hover effect. ( used in the contact page form ) ✨
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
	({ className, ...props }, ref) => {
		const radius = 100 // change this to increase the radius of the hover effect 💫
		const [visible, setVisible] = React.useState(false)

		let mouseX = useMotionValue(0)
		let mouseY = useMotionValue(0)

		function handleMouseMove({ currentTarget, clientY, clientX }: React.MouseEvent<HTMLDivElement>) {
			let { top, left } = currentTarget.getBoundingClientRect()

			mouseX.set(clientX - left)
			mouseY.set(clientY - top)
		}
		return (
			<motion.div
				className="group/textarea rounded-lg p-[2px] transition duration-300"
				onMouseEnter={() => setVisible(true)}
				onMouseLeave={() => setVisible(false)}
				onMouseMove={handleMouseMove}
				style={{
					background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
          var(--primary),
          transparent 80%
        )
      `,
				}}
			>
				<textarea
					className={cn(
						`shadow-input dark:placeholder-text-neutral-600 flex min-h-[80px] w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 group-hover/textarea:shadow-none placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
						className
					)}
					ref={ref}
					{...props}
				/>
			</motion.div>
		)
	}
)
Textarea.displayName = 'Textarea'

export { Textarea }
