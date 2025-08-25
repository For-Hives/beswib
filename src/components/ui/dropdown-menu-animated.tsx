'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/components/ui/button'

type DropdownMenuProps = {
	children: React.ReactNode
	options: {
		Icon?: React.ReactNode
		label: string
		onClick: () => void
	}[]
}

const DropdownMenuAnimated = ({ options, children }: DropdownMenuProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const toggleDropdown = () => {
		setIsOpen(!isOpen)
	}

	const handleOptionClick = (onClick: () => void) => {
		onClick() // Execute the original onClick function
		setIsOpen(false) // Close the dropdown
	}

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	return (
		<div ref={dropdownRef} className="relative z-50">
			<Button
				className="text-muted-foreground hover:bg-accent hover:text-accent-foreground z-50 inline-flex cursor-pointer items-center gap-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
				onClick={toggleDropdown}
				variant="ghost"
			>
				{children ?? 'Menu'}
				<motion.span
					animate={{ rotate: isOpen ? 180 : 0 }}
					className="ml-1"
					transition={{ type: 'spring', ease: 'easeInOut', duration: 0.4 }}
				>
					<ChevronDown className="h-4 w-4" />
				</motion.span>
			</Button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						animate={{ y: 0, scale: 1, filter: 'blur(0px)' }}
						className="bg-background border-border ring-opacity-5 absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md border p-1 shadow-lg ring-1 ring-black backdrop-blur-sm"
						exit={{ y: -5, scale: 0.95, opacity: 0, filter: 'blur(10px)' }}
						initial={{ y: -5, scale: 0.95, filter: 'blur(10px)' }}
						transition={{ type: 'spring', ease: 'circInOut', duration: 0.6 }}
					>
						{options != null && options !== undefined && options.length > 0 ? (
							options.map((option, index) => (
								<motion.button
									animate={{ x: 0, scale: 1, opacity: 1, filter: 'blur(0px)' }}
									className="text-foreground hover:bg-accent data-[focus]:bg-accent z-50 flex w-full cursor-pointer items-center gap-x-2 rounded-lg px-4 py-2 text-left text-sm transition-colors"
									exit={{
										x: 10,
										scale: 0.95,
										opacity: 0,
										filter: 'blur(10px)',
									}}
									initial={{
										x: 10,
										scale: 0.95,
										opacity: 0,
										filter: 'blur(10px)',
									}}
									key={option.label}
									onClick={() => handleOptionClick(option.onClick)}
									transition={{
										type: 'spring',
										ease: 'easeInOut',
										duration: 0.4,
										delay: index * 0.1,
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
									{option.Icon}
									{option.label}
								</motion.button>
							))
						) : (
							<div className="text-muted-foreground px-4 py-2 text-xs">No options</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export { DropdownMenuAnimated }
