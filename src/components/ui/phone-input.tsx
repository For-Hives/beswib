'use client'

import PhoneInputComponent from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { forwardRef } from 'react'

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

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
	({ value, placeholder, onChange, onBlur, error, disabled, defaultCountry = 'US', className }) => {
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
					inputComponent={forwardRef<HTMLInputElement, Record<string, unknown>>(
						({ className: inputClassName, ...props }, inputRef) => (
							<input
								{...props}
								ref={inputRef}
								className={cn(
									'border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
									error === true && 'border-red-500 focus-visible:ring-red-500',
									inputClassName as string
								)}
							/>
						)
					)}
					countrySelectComponent={({
						value: countryValue,
						options,
						onChange: onCountryChange,
						...selectProps
					}: {
						value: string
						options: Array<{ value: string; label: string }>
						onChange: (value: string) => void
						[key: string]: unknown
					}) => (
						<select
							{...selectProps}
							value={countryValue}
							onChange={e => onCountryChange(e.target.value)}
							className={cn(
								'absolute top-1/2 left-1 z-10 -translate-y-1/2',
								'h-8 w-8 cursor-pointer appearance-none border-0 bg-transparent text-transparent',
								'focus-visible:ring-ring focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
								disabled === true && 'cursor-not-allowed opacity-50'
							)}
						>
							{options.map(({ value: optionValue, label }: { value: string; label: string }) => (
								<option key={optionValue} value={optionValue}>
									{label}
								</option>
							))}
						</select>
					)}
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
