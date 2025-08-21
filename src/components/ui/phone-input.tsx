'use client'

import PhoneInputComponent from 'react-phone-number-input'
import { forwardRef, type ComponentProps } from 'react'
import 'react-phone-number-input/style.css'

import { parsePhoneNumber, isValidPhoneNumber, type CountryCode, type E164Number } from 'libphonenumber-js'

import { cn } from '@/lib/utils'

export interface PhoneInputProps {
	value?: string
	onChange?: (value: string) => void
	onBlur?: () => void
	placeholder?: string
	disabled?: boolean
	className?: string
	defaultCountry?: CountryCode
	preferredCountries?: string[]
	error?: boolean
}

interface CustomInputProps extends ComponentProps<'input'> {
	className?: string
}

const PhoneInputField = forwardRef<HTMLInputElement, CustomInputProps>(({ className, ...props }, ref) => (
	<input
		{...props}
		ref={ref}
		className={cn(
			'border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
			className
		)}
	/>
))

PhoneInputField.displayName = 'PhoneInputField'

interface CountrySelectProps extends Omit<ComponentProps<'select'>, 'onChange'> {
	value: string
	options: Array<{ value: string; label: string }>
	onChange: (value: string) => void
	disabled?: boolean
}

const CountrySelect = forwardRef<HTMLSelectElement, CountrySelectProps>(
	({ value, options, onChange, disabled, className, ...props }, ref) => {
		// Filter out non-DOM props that might be passed by react-phone-number-input
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { iconComponent, ...domProps } = props as Record<string, unknown>

		return (
			<select
				{...domProps}
				ref={ref}
				value={value}
				onChange={e => onChange(e.target.value)}
				disabled={disabled}
				className={cn(
					'absolute top-1/2 left-1 z-10 -translate-y-1/2',
					'h-8 w-8 cursor-pointer appearance-none border-0 bg-transparent text-transparent',
					'focus-visible:ring-ring focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
					disabled === true && 'cursor-not-allowed opacity-50',
					className
				)}
			>
				{options.map(({ value: optionValue, label }) => (
					<option key={optionValue} value={optionValue}>
						{label}
					</option>
				))}
			</select>
		)
	}
)

CountrySelect.displayName = 'CountrySelect'

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
	({ value, placeholder, onChange, onBlur, error, disabled, defaultCountry = 'FR', className }) => {
		const handleChange = (val?: E164Number) => {
			onChange?.(val ?? '')
		}

		return (
			<div className={cn('relative', className)}>
				<PhoneInputComponent
					value={value as E164Number | undefined}
					onChange={handleChange}
					onBlur={onBlur}
					defaultCountry={defaultCountry}
					placeholder={placeholder}
					disabled={disabled}
					inputComponent={PhoneInputField}
					countrySelectComponent={CountrySelect}
					className={cn(error === true && '[&>input]:border-red-500 [&>input]:focus-visible:ring-red-500')}
				/>
			</div>
		)
	}
)

PhoneInput.displayName = 'PhoneInput'

// Utility functions for phone validation
export const validatePhoneNumber = (phone: string, country?: string): boolean => {
	if (!phone) return false
	try {
		return isValidPhoneNumber(phone, country as CountryCode | undefined)
	} catch {
		return false
	}
}

export const formatPhoneNumber = (phone: string, country?: string): string => {
	if (!phone) return ''
	try {
		const phoneNumber = parsePhoneNumber(phone, country as CountryCode | undefined)
		return phoneNumber?.formatInternational() || phone
	} catch {
		return phone
	}
}

export const getCountryFromPhoneNumber = (phone: string): string | undefined => {
	if (!phone) return undefined
	try {
		const phoneNumber = parsePhoneNumber(phone)
		return phoneNumber?.country
	} catch {
		return undefined
	}
}
