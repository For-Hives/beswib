'use client'

import { Check } from 'lucide-react'
import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputWithValidationProps extends React.InputHTMLAttributes<HTMLInputElement> {
	/** Whether the field is completed/valid */
	isCompleted?: boolean
	/** Whether the input has an error */
	hasError?: boolean
}

/**
 * Input component with validation indicator (green checkmark when completed)
 * Based on the original inputAlt but with validation visual feedback
 */
const InputWithValidation = React.forwardRef<HTMLInputElement, InputWithValidationProps>(
	({ value, type, isCompleted, hasError, className, ...props }, ref) => {
		const radius = 100 // change this to increase the radius of the hover effect 💫
		const [visible, setVisible] = React.useState(false)

		const mouseX = useMotionValue(0)
		const mouseY = useMotionValue(0)

		// Auto-detect completion if not explicitly provided
		const isFieldCompleted =
			isCompleted ?? (value != null && String(value).trim() !== '' && String(value).trim().length >= 2)

		function handleMouseMove({ currentTarget, clientY, clientX }: React.MouseEvent<HTMLDivElement>) {
			const { top, left } = currentTarget.getBoundingClientRect()

			mouseX.set(clientX - left)
			mouseY.set(clientY - top)
		}

		return (
			<motion.div
				className="group/input relative rounded-lg p-[2px] transition duration-300"
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
						hasError === true && 'border-red-500',
						isFieldCompleted === true && 'pr-10', // Add padding for the check icon
						className
					)}
					ref={ref}
					type={type}
					value={value}
					{...props}
				/>

				{/* Validation check mark */}
				{isFieldCompleted && hasError == null && (
					<Check className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-green-600" />
				)}
			</motion.div>
		)
	}
)

InputWithValidation.displayName = 'InputWithValidation'

export { InputWithValidation }
