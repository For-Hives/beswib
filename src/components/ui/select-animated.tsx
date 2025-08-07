'use client'

import { ChevronDown } from 'lucide-react'
import React, { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

type SelectOption = {
	value: string
	label: string
	icon?: React.ReactNode
}

type SelectAnimatedProps = {
	options: SelectOption[]
	value?: string
	onValueChange: (value: string) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	triggerClassName?: string
	contentClassName?: string
}

const SelectAnimated = ({
	options,
	value,
	onValueChange,
	placeholder = 'Select an option',
	disabled = false,
	className = '',
	triggerClassName = '',
	contentClassName = '',
}: SelectAnimatedProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const selectedOption = options.find(option => option.value === value)

	const toggleDropdown = () => {
		if (!disabled) {
			setIsOpen(!isOpen)
		}
	}

	const handleOptionClick = (optionValue: string) => {
		onValueChange(optionValue)
		setIsOpen(false)
	}

	return (
		<div className={cn('relative z-[9999]', className)}>
			<button
				className={cn(
					'border-input dark:bg-input/30 flex h-9 w-full min-w-0 items-center justify-between rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
					'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
					'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
					'text-foreground placeholder:text-muted-foreground',
					disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
					triggerClassName
				)}
				onClick={toggleDropdown}
				disabled={disabled}
				type="button"
			>
				<div className="flex items-center gap-2">
					{selectedOption?.icon}
					<span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
						{selectedOption?.label ?? placeholder}
					</span>
				</div>
				<motion.span
					animate={{ rotate: isOpen ? 180 : 0 }}
					className="ml-1"
					transition={{ type: 'spring', ease: 'easeInOut', duration: 0.4 }}
				>
					<ChevronDown className="h-4 w-4" />
				</motion.span>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						animate={{ y: 0, scale: 1, filter: 'blur(0px)', zIndex: 9999 }}
						className={cn(
							'bg-background border-border ring-opacity-5 absolute top-full left-0 z-[9999] mt-2 w-full origin-top-right rounded-md border p-1 shadow-lg ring-1 ring-black backdrop-blur-sm',
							contentClassName
						)}
						exit={{ y: -5, scale: 0.95, opacity: 0, filter: 'blur(10px)', zIndex: 9999 }}
						initial={{ y: -5, scale: 0.95, filter: 'blur(10px)', zIndex: 9999 }}
						transition={{ type: 'spring', ease: 'circInOut', duration: 0.6 }}
					>
						{options.length > 0 ? (
							options.map((option, index) => (
								<motion.button
									animate={{ x: 0, scale: 1, opacity: 1, filter: 'blur(0px)', zIndex: 9999 }}
									className={cn(
										'text-foreground hover:bg-accent data-[focus]:bg-accent z-[9999] flex w-full items-center gap-x-2 rounded-lg px-4 py-2 text-left text-sm transition-colors',
										option.value === value ? 'bg-accent text-accent-foreground' : ''
									)}
									exit={{
										x: 10,
										scale: 0.95,
										opacity: 0,
										filter: 'blur(10px)',
										zIndex: 9999,
									}}
									initial={{
										x: 10,
										scale: 0.95,
										opacity: 0,
										filter: 'blur(10px)',
										zIndex: 9999,
									}}
									key={option.value}
									onClick={() => handleOptionClick(option.value)}
									transition={{
										type: 'spring',
										ease: 'easeInOut',
										duration: 0.4,
										delay: index * 0.05,
									}}
									whileHover={{
										transition: {
											ease: 'easeInOut',
											duration: 0.4,
										},
									}}
									whileTap={{
										transition: {
											ease: 'easeInOut',
											duration: 0.2,
										},
										scale: 0.95,
									}}
								>
									{option.icon}
									{option.label}
								</motion.button>
							))
						) : (
							<div className="text-muted-foreground px-4 py-2 text-xs">No options available</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export { SelectAnimated }
export type { SelectOption, SelectAnimatedProps }
