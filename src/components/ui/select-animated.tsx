'use client'

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { createPortal } from 'react-dom'

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
	value,
	triggerClassName = '',
	placeholder = 'Select an option',
	options,
	onValueChange,
	disabled = false,
	contentClassName = '',
	className = '',
}: SelectAnimatedProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [mounted, setMounted] = useState(false)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const selectedOption = options.find(option => option.value === value)

	const toggleDropdown = () => {
		if (disabled) return
		if (!isOpen) {
			setIsOpen(true)
		} else {
			setIsOpen(false)
		}
	}

	const handleOptionClick = (optionValue: string) => {
		onValueChange(optionValue)
		setIsOpen(false)
	}

	// Ensure component is mounted before using portal
	useEffect(() => {
		setMounted(true)
	}, [])

	// Position dropdown when it opens (useLayoutEffect to avoid initial flicker)
	useLayoutEffect(() => {
		if (!isOpen) return
		if (!triggerRef.current || !dropdownRef.current) return

		const triggerRect = triggerRef.current.getBoundingClientRect()
		const dropdown = dropdownRef.current

		dropdown.style.position = 'fixed'
		dropdown.style.top = `${triggerRect.bottom + 8}px`
		dropdown.style.left = `${triggerRect.left}px`

		if (contentClassName?.includes('w-full')) {
			dropdown.style.width = `${triggerRect.width}px`
		} else {
			const minWidth = 120
			dropdown.style.width = `${Math.max(triggerRect.width, minWidth)}px`
		}

		dropdown.style.zIndex = '9999'
	}, [isOpen, contentClassName])

	const renderDropdown = () => {
		if (!mounted) return null

		return createPortal(
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							animate={{ opacity: 1 }}
							className="fixed inset-0 z-[9998]"
							exit={{ opacity: 0 }}
							initial={{ opacity: 0 }}
							onClick={() => setIsOpen(false)}
						/>

						{/* Dropdown content */}
						<motion.div
							ref={dropdownRef}
							animate={{ y: 0, scale: 1, opacity: 1 }}
							className={cn(
								'bg-card border-border ring-opacity-5 max-h-[200px] origin-top-right overflow-hidden overflow-y-auto rounded-md border p-1 shadow-lg ring-1 ring-black',
								// Only apply min-width if no specific width is set in contentClassName
								!contentClassName?.includes('w-') && 'min-w-[120px]',
								contentClassName
							)}
							exit={{ y: -5, scale: 0.98, opacity: 0 }}
							initial={{ y: -5, scale: 0.98, opacity: 0 }}
							transition={{ type: 'spring', ease: 'circInOut', duration: 0.6 }}
						>
							{options.length > 0 ? (
								options.map((option, index) => (
									<motion.button
										animate={{ x: 0, scale: 1, opacity: 1 }}
										className={cn(
											'text-foreground hover:bg-accent data-[focus]:bg-accent my-1 flex w-full items-center gap-x-2 rounded-lg px-4 py-2 text-left text-sm transition-colors',
											option.value === value ? 'bg-accent text-accent-foreground' : ''
										)}
										exit={{
											x: 6,
											scale: 0.98,
											opacity: 0,
										}}
										initial={{
											x: 6,
											scale: 0.98,
											opacity: 0,
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
					</>
				)}
			</AnimatePresence>,
			document.body
		)
	}

	return (
		<div className={cn('relative', className)}>
			<button
				ref={triggerRef}
				className={cn(
					'border-input dark:bg-input/30 my-[1px] flex h-10 min-h-[42px] w-full min-w-[120px] items-center justify-between rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
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
				<div className="flex min-w-0 flex-1 items-center gap-2">
					{selectedOption?.icon}
					<span className={cn(selectedOption ? 'text-foreground' : 'text-muted-foreground', 'truncate')}>
						{selectedOption?.label ?? placeholder}
					</span>
				</div>
				<motion.span
					animate={{ rotate: isOpen ? 180 : 0 }}
					className="ml-2 flex-shrink-0"
					transition={{ type: 'spring', ease: 'easeInOut', duration: 0.4 }}
				>
					<ChevronDown className="h-4 w-4" />
				</motion.span>
			</button>

			{renderDropdown()}
		</div>
	)
}

export { SelectAnimated }
export type { SelectOption, SelectAnimatedProps }
