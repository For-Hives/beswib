'use client'

import * as React from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const alertVariants = cva(
	'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
	{
		variants: {
			variant: {
				destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
				default: 'bg-background text-foreground',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
)

const Alert = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ variant, className, ...props }, ref) => (
	<div className={cn(alertVariants({ variant }), className)} ref={ref} role="alert" {...props} />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h5 className={cn('mb-1 leading-none font-medium tracking-tight', className)} ref={ref} {...props} />
	)
)
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({ className, ...props }, ref) => (
		<div className={cn('text-sm [&_p]:leading-relaxed', className)} ref={ref} {...props} />
	)
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription, AlertTitle }
