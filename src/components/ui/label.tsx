'use client'

import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'

import { cn } from '@/lib/utils'

const Label = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
	<LabelPrimitive.Root
		className={cn(
			'text-sm leading-none font-medium text-black peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-white',
			className
		)}
		ref={ref}
		{...props}
	/>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
