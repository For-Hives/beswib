'use client'

import { PhoneInput as ReactInternationalPhoneInput } from 'react-international-phone'
import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import React, { forwardRef, useState, useEffect } from 'react'
import 'react-international-phone/style.css'

import { cn } from '@/lib/utils'

// Function to detect country from phone number
const detectCountryFromPhoneNumber = (phoneNumber: string): string => {
	if (!phoneNumber?.startsWith('+')) {
		return 'fr' // Default fallback
	}

	// Remove + and get the country code
	const numberWithoutPlus = phoneNumber.substring(1)

	// Common country codes mapping
	const countryCodeMap: Record<string, string> = {
		'998': 'uz', // Uzbekistan
		'996': 'kg', // Kyrgyzstan
		'995': 'ge', // Georgia
		'994': 'az', // Azerbaijan
		'993': 'tm', // Turkmenistan
		'992': 'tj', // Tajikistan
		'977': 'np', // Nepal
		'976': 'mn', // Mongolia
		'975': 'bt', // Bhutan
		'974': 'qa', // Qatar
		'973': 'bh', // Bahrain
		'972': 'il', // Israel
		'971': 'ae', // United Arab Emirates
		'970': 'ps', // Palestine
		'968': 'om', // Oman
		'967': 'ye', // Yemen
		'966': 'sa', // Saudi Arabia
		'965': 'kw', // Kuwait
		'964': 'iq', // Iraq
		'963': 'sy', // Syria
		'962': 'jo', // Jordan
		'961': 'lb', // Lebanon
		'960': 'mv', // Maldives
		'886': 'tw', // Taiwan
		'880': 'bd', // Bangladesh
		'856': 'la', // Laos
		'855': 'kh', // Cambodia
		'853': 'mo', // Macau
		'852': 'hk', // Hong Kong
		'850': 'kp', // North Korea
		'692': 'mh', // Marshall Islands
		'691': 'fm', // Federated States of Micronesia
		'690': 'tk', // Tokelau
		'689': 'pf', // French Polynesia
		'688': 'tv', // Tuvalu
		'687': 'nc', // New Caledonia
		'686': 'ki', // Kiribati
		'685': 'ws', // Samoa
		'684': 'as', // American Samoa
		'683': 'nu', // Niue
		'682': 'ck', // Cook Islands
		'681': 'wf', // Wallis and Futuna
		'680': 'pw', // Palau
		'679': 'fj', // Fiji
		'678': 'vu', // Vanuatu
		'677': 'sb', // Solomon Islands
		'676': 'to', // Tonga
		'675': 'pg', // Papua New Guinea
		'674': 'nr', // Nauru
		'673': 'bn', // Brunei
		'672': 'aq', // Antarctica
		'670': 'tl', // East Timor
		'599': 'cw', // Curaçao
		'598': 'uy', // Uruguay
		'597': 'sr', // Suriname
		'596': 'mq', // Martinique
		'595': 'py', // Paraguay
		'594': 'gf', // French Guiana
		'593': 'ec', // Ecuador
		'592': 'gy', // Guyana
		'591': 'bo', // Bolivia
		'590': 'gp', // Guadeloupe
		'509': 'ht', // Haiti
		'508': 'pm', // Saint Pierre and Miquelon
		'507': 'pa', // Panama
		'506': 'cr', // Costa Rica
		'505': 'ni', // Nicaragua
		'504': 'hn', // Honduras
		'503': 'sv', // El Salvador
		'502': 'gt', // Guatemala
		'501': 'bz', // Belize
		'500': 'fk', // Falkland Islands
		'423': 'li', // Liechtenstein
		'421': 'sk', // Slovakia
		'420': 'cz', // Czech Republic
		'389': 'mk', // North Macedonia
		'387': 'ba', // Bosnia and Herzegovina
		'386': 'si', // Slovenia
		'385': 'hr', // Croatia
		'383': 'xk', // Kosovo
		'382': 'me', // Montenegro
		'381': 'rs', // Serbia
		'380': 'ua', // Ukraine
		'378': 'sm', // San Marino
		'377': 'mc', // Monaco
		'376': 'ad', // Andorra
		'375': 'by', // Belarus
		'374': 'am', // Armenia
		'373': 'md', // Moldova
		'372': 'ee', // Estonia
		'371': 'lv', // Latvia
		'370': 'lt', // Lithuania
		'359': 'bg', // Bulgaria
		'358': 'fi', // Finland
		'357': 'cy', // Cyprus
		'356': 'mt', // Malta
		'355': 'al', // Albania
		'354': 'is', // Iceland
		'353': 'ie', // Ireland
		'352': 'lu', // Luxembourg
		'351': 'pt', // Portugal
		'350': 'gi', // Gibraltar
		'299': 'gl', // Greenland
		'298': 'fo', // Faroe Islands
		'297': 'aw', // Aruba
		'291': 'er', // Eritrea
		'290': 'sh', // Saint Helena
		'269': 'km', // Comoros
		'268': 'sz', // Eswatini
		'267': 'bw', // Botswana
		'266': 'ls', // Lesotho
		'265': 'mw', // Malawi
		'264': 'na', // Namibia
		'263': 'zw', // Zimbabwe
		'262': 're', // Reunion
		'261': 'mg', // Madagascar
		'260': 'zm', // Zambia
		'258': 'mz', // Mozambique
		'257': 'bi', // Burundi
		'256': 'ug', // Uganda
		'255': 'tz', // Tanzania
		'254': 'ke', // Kenya
		'253': 'dj', // Djibouti
		'252': 'so', // Somalia
		'251': 'et', // Ethiopia
		'250': 'rw', // Rwanda
		'249': 'sd', // Sudan
		'248': 'sc', // Seychelles
		'247': 'ac', // Ascension Island
		'246': 'io', // British Indian Ocean Territory
		'245': 'gw', // Guinea-Bissau
		'244': 'ao', // Angola
		'243': 'cd', // Democratic Republic of the Congo
		'242': 'cg', // Republic of the Congo
		'241': 'ga', // Gabon
		'240': 'gq', // Equatorial Guinea
		'239': 'st', // Sao Tome and Principe
		'238': 'cv', // Cape Verde
		'237': 'cm', // Cameroon
		'236': 'cf', // Central African Republic
		'235': 'td', // Chad
		'234': 'ng', // Nigeria
		'233': 'gh', // Ghana
		'232': 'sl', // Sierra Leone
		'231': 'lr', // Liberia
		'230': 'mu', // Mauritius
		'229': 'bj', // Benin
		'228': 'tg', // Togo
		'227': 'ne', // Niger
		'226': 'bf', // Burkina Faso
		'225': 'ci', // Ivory Coast
		'224': 'gn', // Guinea
		'223': 'ml', // Mali
		'222': 'mr', // Mauritania
		'221': 'sn', // Senegal
		'220': 'gm', // Gambia
		'218': 'ly', // Libya
		'216': 'tn', // Tunisia
		'213': 'dz', // Algeria
		'212': 'ma', // Morocco
		'98': 'ir', // Iran
		'95': 'mm', // Myanmar
		'94': 'lk', // Sri Lanka
		'93': 'af', // Afghanistan
		'92': 'pk', // Pakistan
		'91': 'in', // India
		'90': 'tr', // Turkey
		'86': 'cn', // China
		'84': 'vn', // Vietnam
		'82': 'kr', // South Korea
		'81': 'jp', // Japan
		'66': 'th', // Thailand
		'65': 'sg', // Singapore
		'64': 'nz', // New Zealand
		'63': 'ph', // Philippines
		'62': 'id', // Indonesia
		'61': 'au', // Australia
		'60': 'my', // Malaysia
		'58': 've', // Venezuela
		'57': 'co', // Colombia
		'56': 'cl', // Chile
		'55': 'br', // Brazil
		'54': 'ar', // Argentina
		'53': 'cu', // Cuba
		'52': 'mx', // Mexico
		'51': 'pe', // Peru
		'49': 'de', // Germany
		'48': 'pl', // Poland
		'47': 'no', // Norway
		'46': 'se', // Sweden
		'45': 'dk', // Denmark
		'44': 'gb', // UK
		'43': 'at', // Austria
		'41': 'ch', // Switzerland
		'40': 'ro', // Romania
		'39': 'it', // Italy
		'36': 'hu', // Hungary
		'34': 'es', // Spain
		'33': 'fr', // France
		'32': 'be', // Belgium
		'31': 'nl', // Netherlands
		'30': 'gr', // Greece
		'27': 'za', // South Africa
		'20': 'eg', // Egypt
		'7': 'ru', // Russia
		'1': 'us', // USA/Canada
	}

	// Try to find the longest matching country code first
	for (let i = 4; i >= 1; i--) {
		const potentialCode = numberWithoutPlus.substring(0, i)
		if (countryCodeMap[potentialCode]) {
			return countryCodeMap[potentialCode]
		}
	}

	return 'fr' // Default fallback if no match found
}

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

		// Detect country from existing phone number value
		const hasValue = Boolean(value && value.trim() !== '')
		const detectedCountry = hasValue && value.startsWith('+') ? detectCountryFromPhoneNumber(value) : defaultCountry

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
					defaultCountry={detectedCountry}
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
