'use client'

import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { getDateFormatPattern } from '@/lib/utils/date'

export interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	locale?: string
	showHelper?: boolean
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
	({ showHelper = true, locale = 'en', className, ...props }, ref) => {
		const radius = 100 // change this to increase the radius of the hover effect
		const [visible, setVisible] = React.useState(false)
		const dateFormat = getDateFormatPattern(locale)

		const mouseX = useMotionValue(0)
		const mouseY = useMotionValue(0)

		function handleMouseMove({ currentTarget, clientY, clientX }: React.MouseEvent<HTMLDivElement>) {
			const { top, left } = currentTarget.getBoundingClientRect()

			mouseX.set(clientX - left)
			mouseY.set(clientY - top)
		}

		return (
			<div className="space-y-1">
				<motion.div
					className="group/input rounded-lg p-[2px] transition duration-300"
					onMouseEnter={() => setVisible(true)}
					onMouseLeave={() => setVisible(false)}
					onMouseMove={handleMouseMove}
					style={{
						background: useMotionTemplate`
				radial-gradient(
				  ${visible ? `${radius}px` : '0px'} circle at ${mouseX}px ${mouseY}px,
				  var(--interactive-bubble),
				  transparent 80%
				)
			  `,
					}}
				>
					<input
						className={cn(
							`shadow-input dark:placeholder-text-neutral-600 bg-background text-foreground placeholder:text-foreground/50 focus-visible:ring-ring border-input flex h-10 w-full rounded-md border px-3 py-2 text-sm transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
							className
						)}
						ref={ref}
						type="date"
						{...props}
					/>
				</motion.div>
				{showHelper && <p className="text-muted-foreground text-xs">Format: {dateFormat}</p>}
			</div>
		)
	}
)

DateInput.displayName = 'DateInput'

export { DateInput }
