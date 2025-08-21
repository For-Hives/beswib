'use client'

import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import { Check, AlertCircle, Phone } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import * as React from 'react'

import { isValidPhoneNumber, parsePhoneNumber, getCountries, getCountryCallingCode } from 'react-phone-number-input'

type CountryCode = string
import { cn } from '@/lib/utils'

interface PhoneInputProps {
	value?: string
	onChange?: (value: string | undefined) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	error?: boolean
	label?: React.ReactNode
	helperText?: string
}

// Liste des pays les plus couramment utilisés
const PRIORITY_COUNTRIES: CountryCode[] = ['FR', 'US', 'GB', 'DE', 'ES', 'IT', 'CA', 'AU', 'BE', 'CH', 'NL']

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
	({ value, onChange, placeholder = 'Entrez votre numéro', disabled, className, error, label, helperText, ...props }, ref) => {
		const radius = 100
		const [visible, setVisible] = useState(false)
		const [selectedCountry, setSelectedCountry] = useState<CountryCode>('FR')
		const [phoneNumber, setPhoneNumber] = useState('')
		const [isValid, setIsValid] = useState<boolean | null>(null)
		const [showDropdown, setShowDropdown] = useState(false)
		const [searchTerm, setSearchTerm] = useState('')
		
		const dropdownRef = useRef<HTMLDivElement>(null)
		const inputRef = useRef<HTMLInputElement>(null)

		let mouseX = useMotionValue(0)
		let mouseY = useMotionValue(0)

		// Obtenir la liste de tous les pays
		const allCountries = getCountries()
		
		// Trier les pays : priorité d'abord, puis alphabétique
		const sortedCountries = React.useMemo(() => {
			const priority = PRIORITY_COUNTRIES.filter(code => allCountries.includes(code as any))
			const others = allCountries.filter(code => !PRIORITY_COUNTRIES.includes(code as any))
			return [...priority, ...others]
		}, [allCountries])

		// Filtrer les pays selon la recherche
		const filteredCountries = React.useMemo(() => {
			if (!searchTerm) return sortedCountries
			return sortedCountries.filter(code => {
				const countryName = getCountryName(code)
				const callingCode = getCountryCallingCode(code as any)
				return (
					countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					callingCode.includes(searchTerm)
				)
			})
		}, [sortedCountries, searchTerm])

		// Fonction pour obtenir le nom du pays
		function getCountryName(countryCode: CountryCode): string {
			const names: Record<string, string> = {
				'FR': 'France', 'US': 'États-Unis', 'GB': 'Royaume-Uni', 'DE': 'Allemagne',
				'ES': 'Espagne', 'IT': 'Italie', 'CA': 'Canada', 'AU': 'Australie',
				'BE': 'Belgique', 'CH': 'Suisse', 'NL': 'Pays-Bas', 'PT': 'Portugal',
				'BR': 'Brésil', 'MX': 'Mexique', 'AR': 'Argentine', 'CL': 'Chili',
				'CO': 'Colombie', 'PE': 'Pérou', 'VE': 'Venezuela', 'UY': 'Uruguay',
				'PY': 'Paraguay', 'BO': 'Bolivie', 'EC': 'Équateur', 'GY': 'Guyana',
				'SR': 'Suriname', 'GF': 'Guyane française'
			}
			return names[countryCode] || countryCode
		}

		// Fonction pour obtenir l'emoji du drapeau
		function getFlagEmoji(countryCode: CountryCode): string {
			return countryCode
				.toUpperCase()
				.replace(/./g, (char: string) => String.fromCodePoint(127397 + char.charCodeAt(0)))
		}

		// Initialiser avec la valeur existante
		useEffect(() => {
			if (value) {
				try {
					const parsed = parsePhoneNumber(value)
					if (parsed) {
						setSelectedCountry(parsed.country || 'FR')
						setPhoneNumber(parsed.nationalNumber)
						setIsValid(true)
					}
				} catch {
					setPhoneNumber(value)
					setIsValid(false)
				}
			}
		}, [value])

		// Valider le numéro en temps réel
		useEffect(() => {
			if (!phoneNumber) {
				setIsValid(null)
				onChange?.(undefined)
				return
			}

			const fullNumber = `+${getCountryCallingCode(selectedCountry as any)}${phoneNumber}`
			
			try {
				const valid = isValidPhoneNumber(fullNumber)
				setIsValid(valid)
				onChange?.(valid ? fullNumber : undefined)
			} catch {
				setIsValid(false)
				onChange?.(undefined)
			}
		}, [phoneNumber, selectedCountry, onChange])

		// Gérer les clics à l'extérieur
		useEffect(() => {
			function handleClickOutside(event: MouseEvent) {
				if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
					setShowDropdown(false)
					setSearchTerm('')
				}
			}

			if (showDropdown) {
				document.addEventListener('mousedown', handleClickOutside)
				return () => document.removeEventListener('mousedown', handleClickOutside)
			}
		}, [showDropdown])

		function handleMouseMove({ currentTarget, clientY, clientX }: React.MouseEvent<HTMLDivElement>) {
			let { top, left } = currentTarget.getBoundingClientRect()
			mouseX.set(clientX - left)
			mouseY.set(clientY - top)
		}

		const handleCountrySelect = (countryCode: CountryCode) => {
			setSelectedCountry(countryCode)
			setShowDropdown(false)
			setSearchTerm('')
			inputRef.current?.focus()
		}

		const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value.replace(/[^\d]/g, '') // Garder seulement les chiffres
			setPhoneNumber(newValue)
		}

		const getValidationIcon = () => {
			if (isValid === true) return <Check className="h-4 w-4 text-green-500" />
			if (isValid === false) return <AlertCircle className="h-4 w-4 text-red-500" />
			return <Phone className="h-4 w-4 text-muted-foreground" />
		}

		const inputId = React.useId()

		return (
			<div className={cn('space-y-2', className)}>
				{label && (
					<label htmlFor={inputId} className="text-foreground text-sm font-medium">
						{label}
					</label>
				)}
				
				<motion.div
					className="group/input rounded-lg p-[2px] transition duration-300"
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
					<div className={cn(
						'shadow-input dark:placeholder-text-neutral-600 bg-background text-foreground border-input flex rounded-md border transition duration-400 group-hover/input:shadow-none dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-within:ring-neutral-600',
						error && 'border-destructive',
						isValid === true && 'border-green-500',
						isValid === false && 'border-red-500'
					)}>
						{/* Sélecteur de pays */}
						<div className="relative">
							<button
								type="button"
								onClick={() => setShowDropdown(!showDropdown)}
								disabled={disabled}
								className={cn(
									'flex items-center gap-2 px-3 py-2 text-sm border-r border-border hover:bg-muted/50 transition-colors rounded-l-md',
									disabled && 'opacity-50 cursor-not-allowed'
								)}
							>
								<span className="text-lg">{getFlagEmoji(selectedCountry)}</span>
								<span className="text-muted-foreground">+{getCountryCallingCode(selectedCountry as any)}</span>
								<svg className="h-3 w-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{/* Dropdown des pays */}
							{showDropdown && (
								<div
									ref={dropdownRef}
									className="absolute top-full left-0 z-50 mt-1 w-80 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-hidden"
								>
									{/* Barre de recherche */}
									<div className="p-2 border-b border-border">
										<input
											type="text"
											placeholder="Rechercher un pays..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="w-full px-3 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
										/>
									</div>

									{/* Liste des pays */}
									<div className="overflow-y-auto max-h-48">
										{filteredCountries.map((countryCode) => (
											<button
												key={countryCode}
												type="button"
												onClick={() => handleCountrySelect(countryCode)}
												className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-left"
											>
												<span className="text-lg">{getFlagEmoji(countryCode)}</span>
												<span className="flex-1">{getCountryName(countryCode)}</span>
												<span className="text-muted-foreground">+{getCountryCallingCode(countryCode as any)}</span>
											</button>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Input du numéro */}
						<input
							{...props}
							ref={inputRef}
							id={inputId}
							type="tel"
							value={phoneNumber}
							onChange={handlePhoneChange}
							placeholder={placeholder}
							disabled={disabled}
							className={cn(
								'flex-1 px-3 py-2 text-sm bg-transparent border-0 outline-none placeholder:text-foreground/50 disabled:cursor-not-allowed disabled:opacity-50'
							)}
						/>

						{/* Icône de validation */}
						<div className="flex items-center px-3">
							{getValidationIcon()}
						</div>
					</div>
				</motion.div>

				{/* Texte d'aide */}
				{helperText && (
					<p className={cn(
						'text-xs',
						error ? 'text-destructive' : 'text-muted-foreground'
					)}>
						{helperText}
					</p>
				)}

				{/* Message de validation */}
				{isValid === false && phoneNumber && (
					<p className="text-xs text-destructive">
						Numéro de téléphone invalide
					</p>
				)}
			</div>
		)
	}
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }