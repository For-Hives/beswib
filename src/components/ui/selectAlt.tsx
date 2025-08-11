'use client'

import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import * as SelectPrimitive from '@radix-ui/react-select'
import * as React from 'react'

import { cn } from '@/lib/utils'

function SelectAlt({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectContentAlt({
	position = 'popper',
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				className={cn(
					'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md',
					position === 'popper' &&
						'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
					className
				)}
				data-slot="select-content"
				position={position}
				{...props}
			>
				<SelectPrimitive.Viewport
					className={cn(
						'p-1',
						position === 'popper' &&
							'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	)
}

function SelectItemAlt({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			className={cn(
				"focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
				className
			)}
			data-slot="select-item"
			{...props}
		>
			<span className="absolute right-2 flex size-3.5 items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<CheckIcon className="size-4" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	)
}

function SelectTriggerAlt({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
	const radius = 100 // change this to increase the radius of the hover effect
	const [visible, setVisible] = React.useState(false)

	let mouseX = useMotionValue(0)
	let mouseY = useMotionValue(0)

	function handleMouseMove({ currentTarget, clientY, clientX }: React.MouseEvent<HTMLDivElement>) {
		let { top, left } = currentTarget.getBoundingClientRect()

		mouseX.set(clientX - left)
		mouseY.set(clientY - top)
	}

	return (
		<motion.div
			className="group/select rounded-lg p-[2px] transition duration-300"
			onMouseEnter={() => setVisible(true)}
			onMouseLeave={() => setVisible(false)}
			onMouseMove={handleMouseMove}
			style={{
				background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
          var(--primary),
          transparent 80%
        )
      `,
			}}
		>
			<SelectPrimitive.Trigger
				className={cn(
					`shadow-input dark:placeholder-text-neutral-600 bg-background text-foreground placeholder:text-foreground/50 focus-visible:ring-ring data-[placeholder]:text-foreground/50 hover:bg-foreground/5 border-input flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition duration-400 group-hover/select:shadow-none focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:hover:bg-zinc-800 dark:focus-visible:ring-neutral-600 dark:data-[placeholder]:text-neutral-600`,
					className
				)}
				data-slot="select-trigger"
				{...props}
			>
				{children}
				<SelectPrimitive.Icon asChild>
					<ChevronDownIcon className="size-4 opacity-50" />
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>
		</motion.div>
	)
}

function SelectValueAlt({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
	return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

export { SelectAlt, SelectContentAlt, SelectItemAlt, SelectTriggerAlt, SelectValueAlt }
