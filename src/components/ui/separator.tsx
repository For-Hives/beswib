'use client'

import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as React from 'react'

import { cn } from '@/lib/utils'

const Separator = React.forwardRef<
	React.ElementRef<typeof SeparatorPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ orientation = 'horizontal', decorative = true, className, ...props }, ref) => (
	<SeparatorPrimitive.Root
		className={cn('bg-border shrink-0', orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', className)}
		decorative={decorative}
		orientation={orientation}
		ref={ref}
		{...props}
	/>
))
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
