'use client'

import { PhoneInput as ReactInternationalPhoneInput } from 'react-international-phone'
import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import React, { forwardRef, useState, useEffect } from 'react'
import 'react-international-phone/style.css'

import { cn } from '@/lib/utils'

export interface PhoneInputProps {
	value?: string
	onChange?: (value: string) => void
	onBlur?: () => void
	placeholder?: string
	disabled?: boolean
	className?: string
	defaultCountry?: string
	error?: boolean
}

// Enhanced PhoneInput wrapper with motion effects like inputAlt
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
	({ value, placeholder, onChange, onBlur, error, disabled, defaultCountry = 'fr', className }, ref) => {
		const [mounted, setMounted] = useState(false)

		useEffect(() => {
			setMounted(true)
		}, [])

		// Prevent SSR hydration mismatch by only rendering phone input after mount
		if (!mounted) {
			return (
				<div className={cn('relative z-20', className)}>
					<input
						ref={ref}
						value={value ?? ''}
						onChange={e => onChange?.(e.target.value)}
						onBlur={onBlur}
						placeholder={placeholder}
						disabled={disabled}
						className={cn(
							'border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
							error === true && 'border-red-500 focus-visible:ring-red-500'
						)}
					/>
				</div>
			)
		}

		return (
			<div className="relative z-[9999]">
				<PhoneInputWithMotion
					value={value}
					placeholder={placeholder}
					onChange={onChange}
					onBlur={onBlur}
					error={error}
					disabled={disabled}
					defaultCountry={defaultCountry}
					className={className}
				/>
			</div>
		)
	}
)

// Separate component for motion effects to avoid hooks violations
const PhoneInputWithMotion = ({
	value,
	placeholder,
	onChange,
	onBlur,
	error,
	disabled,
	defaultCountry = 'fr',
	className,
}: PhoneInputProps) => {
	const radius = 100
	const [visible, setVisible] = useState(false)

	const mouseX = useMotionValue(0)
	const mouseY = useMotionValue(0)

	function handleMouseMove({ currentTarget, clientY, clientX }: React.MouseEvent<HTMLDivElement>) {
		const { top, left } = currentTarget.getBoundingClientRect()
		mouseX.set(clientX - left)
		mouseY.set(clientY - top)
	}

	return (
		<motion.div
			className={cn('group/input z-[9999] w-full rounded-lg p-[2px] transition duration-300', className)}
			onMouseEnter={() => setVisible(true)}
			onMouseLeave={() => setVisible(false)}
			onMouseMove={handleMouseMove}
			style={{
				background: useMotionTemplate`
					radial-gradient(
						${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
						var(--interactive-bubble),
						transparent 80%
					)
				`,
			}}
		>
			<div className="bg-background rounded-lg">
				<ReactInternationalPhoneInput
					defaultCountry={defaultCountry}
					value={value ?? ''}
					onChange={onChange}
					onBlur={onBlur}
					placeholder={placeholder}
					disabled={disabled}
					inputClassName={cn(
						'border-input bg-background text-foreground placeholder:text-foreground/50 focus-visible:ring-ring flex h-10 w-full rounded-r-md border-r border-t border-b border-l-0 px-3 py-2 text-sm transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow-input dark:placeholder-text-neutral-600 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600',
						error === true && 'border-red-500 focus-visible:ring-red-500'
					)}
					countrySelectorStyleProps={{
						dropdownStyleProps: {
							style: {
								zIndex: 9999,
								overflowY: 'auto' as const,
								minWidth: '250px',
								maxHeight: '200px',
								boxShadow: 'var(--shadow-lg)',
								borderRadius: 'var(--radius)',
								border: '1px solid hsl(var(--border))',
								backgroundColor: 'hsl(var(--background))',
							},
							listItemStyle: {
								transition: 'background-color 0.2s ease',
								padding: '0.5rem 0.75rem',
								fontSize: '0.875rem',
								cursor: 'pointer',
								color: 'hsl(var(--foreground))',
								borderBottom: '1px solid hsl(var(--border) / 0.3)',
							},
						},
						buttonStyle: {
							transition: 'background-color 0.15s ease-in-out',
							minWidth: '52px',
							justifyContent: 'center',
							height: '40px',
							display: 'flex',
							color: 'hsl(var(--foreground))',
							boxShadow: 'var(--shadow-sm)',
							borderRight: 'none',
							borderRadius: 'var(--radius) 0 0 var(--radius)',
							border: '1px solid hsl(var(--border))',
							backgroundColor: 'hsl(var(--background))',
							alignItems: 'center',
						},
					}}
					className="z-[9999]"
				/>
			</div>
		</motion.div>
	)
}

PhoneInput.displayName = 'PhoneInput'
