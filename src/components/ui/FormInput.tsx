'use client'

import { Eye, EyeOff } from 'lucide-react'
import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import * as React from 'react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { FieldError } from '@/types/auth'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string
	error?: FieldError | null
	success?: boolean
	helperText?: string
	showPasswordToggle?: boolean
	validText?: string
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
	({ validText = 'Valid', type, success, showPasswordToggle, label, helperText, error, className, ...props }, ref) => {
		const radius = 100
		const [visible, setVisible] = React.useState(false)
		const [showPassword, setShowPassword] = React.useState(false)
		const [inputType, setInputType] = React.useState(type)

		const mouseX = useMotionValue(0)
		const mouseY = useMotionValue(0)

		useEffect(() => {
			if (type === 'password' && showPasswordToggle === true) {
				setInputType(showPassword ? 'text' : 'password')
			}
		}, [showPassword, type, showPasswordToggle])

		function handleMouseMove({ currentTarget, clientY, clientX }: React.MouseEvent<HTMLDivElement>) {
			const { top, left } = currentTarget.getBoundingClientRect()
			mouseX.set(clientX - left)
			mouseY.set(clientY - top)
		}

		const inputId = React.useId()

		return (
			<div className="space-y-2">
				<label htmlFor={inputId} className="text-foreground text-sm font-medium">
					{label}
				</label>

				<div className="relative">
					<motion.div
						className={cn(
							'group/input rounded-lg p-[2px] transition duration-300',
							error != null && 'bg-destructive/20',
							success === true && 'bg-emerald-500/20'
						)}
						onMouseEnter={() => setVisible(true)}
						onMouseLeave={() => setVisible(false)}
						onMouseMove={handleMouseMove}
						style={{
							background:
								error != null
									? useMotionTemplate`
									radial-gradient(
										${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
										hsl(var(--destructive) / 0.3),
										transparent 80%
									)
								`
									: success === true
										? useMotionTemplate`
									radial-gradient(
										${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
										hsl(142 76% 36% / 0.3),
										transparent 80%
									)
								`
										: useMotionTemplate`
									radial-gradient(
										${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
										var(--interactive-bubble),
										transparent 80%
									)
								`,
						}}
					>
						<div className="relative">
							<input
								id={inputId}
								className={cn(
									`shadow-input dark:placeholder-text-neutral-600 bg-background text-foreground placeholder:text-foreground/50 focus-visible:ring-ring border-input flex h-10 w-full rounded-md border px-3 py-2 text-sm transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
									error != null && 'border-destructive focus-visible:ring-destructive/20',
									success === true && 'border-emerald-500 focus-visible:ring-emerald-500/20',
									showPasswordToggle === true && 'pr-10',
									className
								)}
								ref={ref}
								type={inputType}
								{...props}
							/>

							{showPasswordToggle === true && type === 'password' && (
								<button
									type="button"
									className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center transition-colors"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							)}
						</div>
					</motion.div>
				</div>

				{/* Error message */}
				{error && (
					<p className="text-destructive mt-1 flex items-center gap-1 text-xs">
						<span className="text-destructive">⚠</span>
						{error.message}
					</p>
				)}

				{/* Success message */}
				{success === true && error == null && (
					<p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
						<span className="text-emerald-600">✓</span>
						{validText}
					</p>
				)}

				{/* Helper text */}
				{helperText != null && helperText !== '' && error == null && success !== true && (
					<p className="text-muted-foreground mt-1 text-xs">{helperText}</p>
				)}
			</div>
		)
	}
)

FormInput.displayName = 'FormInput'

export { FormInput }
