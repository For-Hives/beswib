'use client'

import React from 'react'
import PhoneInputLib, { type Value } from 'react-phone-number-input'
import { cn } from '@/lib/utils'
import 'react-phone-number-input/style.css'

interface PhoneInputProps {
	value?: Value
	onChange?: (value: Value) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	error?: boolean
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
	({ value, onChange, placeholder = 'Enter phone number', disabled, className, error, ...props }, ref) => {
		return (
			<div className={cn('relative', className)}>
				<PhoneInputLib
					{...props}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					disabled={disabled}
					className={cn(
						'phone-input-container',
						error && 'phone-input-error'
					)}
					inputComponent={React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
						(inputProps, inputRef) => (
							<input
								{...inputProps}
								ref={inputRef}
								className={cn(
									'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background text-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
									'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
									error && 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-destructive',
									inputProps.className
								)}
							/>
						)
					)}
				/>
				<style jsx global>{`
					.phone-input-container {
						width: 100%;
					}
					
					.phone-input-container .PhoneInputCountrySelect {
						margin-right: 8px;
						border: 1px solid hsl(var(--border));
						border-radius: 6px;
						background: hsl(var(--background));
						color: hsl(var(--foreground));
						padding: 4px 8px;
						font-size: 14px;
						height: 36px;
						min-width: 60px;
					}
					
					.phone-input-container .PhoneInputCountrySelect:focus {
						outline: none;
						border-color: hsl(var(--ring));
						box-shadow: 0 0 0 3px hsl(var(--ring) / 0.5);
					}
					
					.phone-input-container .PhoneInputCountrySelect option {
						background: hsl(var(--background));
						color: hsl(var(--foreground));
					}
					
					.phone-input-container.phone-input-error .PhoneInputCountrySelect {
						border-color: hsl(var(--destructive));
					}
					
					.phone-input-container .PhoneInputInput {
						flex: 1;
						margin-left: 8px;
					}
					
					@media (prefers-color-scheme: dark) {
						.phone-input-container .PhoneInputCountrySelect {
							background: hsl(var(--background));
							border-color: hsl(var(--border));
						}
					}
				`}</style>
			</div>
		)
	}
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }