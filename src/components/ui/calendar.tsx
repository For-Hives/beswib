'use client'

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import * as React from 'react'
import { useEffect } from 'react'
import { type DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Event } from '@/models/event.model'

type ChevronProps = React.SVGProps<SVGSVGElement> & {
	className?: string
	orientation?: 'down' | 'left' | 'right' | 'up'
}

function Calendar({
	showOutsideDays = true,
	formatters,
	events,
	components,
	classNames,
	className,
	captionLayout = 'label',
	buttonVariant = 'ghost',
	...props
}: React.ComponentProps<typeof DayPicker> & {
	buttonVariant?: React.ComponentProps<typeof Button>['variant']
	events?: Event[]
}) {
	const defaultClassNames = getDefaultClassNames()

	return (
		<DayPicker
			captionLayout={captionLayout}
			className={cn(
				'bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
				String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
				String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
				className
			)}
			classNames={{
				weekdays: cn('flex', defaultClassNames.weekdays),
				weekday: cn(
					'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none',
					defaultClassNames.weekday
				),
				week_number_header: cn('select-none w-(--cell-size)', defaultClassNames.week_number_header),
				week_number: cn('text-[0.8rem] select-none text-muted-foreground', defaultClassNames.week_number),
				week: cn('flex w-full mt-2', defaultClassNames.week),
				today: cn(
					'bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none',
					defaultClassNames.today
				),
				table: 'w-full border-collapse',
				root: cn('w-fit', defaultClassNames.root),
				range_start: cn('rounded-l-md bg-accent', defaultClassNames.range_start),
				range_middle: cn('rounded-none', defaultClassNames.range_middle),
				range_end: cn('rounded-r-md bg-accent', defaultClassNames.range_end),
				outside: cn('text-muted-foreground aria-selected:text-muted-foreground', defaultClassNames.outside),
				nav: cn('flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between', defaultClassNames.nav),
				months: cn('flex gap-4 flex-col md:flex-row relative', defaultClassNames.months),
				month_caption: cn(
					'flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)',
					defaultClassNames.month_caption
				),
				month: cn('flex flex-col w-full gap-4', defaultClassNames.month),
				hidden: cn('invisible', defaultClassNames.hidden),
				dropdowns: cn(
					'w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5',
					defaultClassNames.dropdowns
				),
				dropdown_root: cn(
					'relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md',
					defaultClassNames.dropdown_root
				),
				dropdown: cn('absolute inset-0 opacity-0', defaultClassNames.dropdown),
				disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
				day: cn(
					'relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none',
					defaultClassNames.day
				),
				caption_label: cn(
					'select-none font-medium',
					captionLayout === 'label'
						? 'text-sm'
						: 'rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5',
					defaultClassNames.caption_label
				),
				button_previous: cn(
					buttonVariants({ variant: buttonVariant }),
					'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none',
					defaultClassNames.button_previous
				),
				button_next: cn(
					buttonVariants({ variant: buttonVariant }),
					'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none',
					defaultClassNames.button_next
				),
				...classNames,
			}}
			components={{
				WeekNumber,
				Root,
				DayButton: props => <CalendarDayButton {...props} events={events} />,
				Chevron,
				...components,
			}}
			formatters={{
				formatMonthDropdown: date => date.toLocaleString('default', { month: 'short' }),
				...formatters,
			}}
			showOutsideDays={showOutsideDays}
			{...props}
		/>
	)
}

function CalendarDayButton({
	modifiers,
	events,
	day,
	className,
	...props
}: React.ComponentProps<typeof DayButton> & { events?: Event[] }) {
	const defaultClassNames = getDefaultClassNames()

	const ref = React.useRef<HTMLButtonElement>(null)
	useEffect(() => {
		if (modifiers.focused) ref.current?.focus()
	}, [modifiers.focused])

	const hasEvents = events?.some(event => {
		const eventDay = event.eventDate instanceof Date ? event.eventDate : new Date(event.eventDate)
		return eventDay.toDateString() === day.date.toDateString()
	})

	return (
		<Button
			className={cn(
				'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70',
				defaultClassNames.day,
				className
			)}
			data-day={day.date.toLocaleDateString()}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			data-range-start={modifiers.range_start}
			data-selected-single={
				modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
			}
			ref={ref}
			size="icon"
			variant="ghost"
			{...props}
		>
			{day.date.getDate()}
			{(hasEvents ?? false) && (
				<div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-blue-500" />
			)}
		</Button>
	)
}

function Chevron({ orientation, className, ...props }: ChevronProps) {
	if (orientation === 'left') {
		return <ChevronLeftIcon className={cn('size-4', className)} {...props} />
	}
	if (orientation === 'right') {
		return <ChevronRightIcon className={cn('size-4', className)} {...props} />
	}
	return <ChevronDownIcon className={cn('size-4', className)} {...props} />
}

function Root({
	rootRef,
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> & { rootRef?: React.Ref<HTMLDivElement> }) {
	return <div className={cn(className)} data-slot="calendar" ref={rootRef} {...props} />
}

function WeekNumber({
	children,
	...props
}: React.HTMLAttributes<HTMLTableCellElement> & { children?: React.ReactNode }) {
	return (
		<td {...props}>
			<div className="flex size-(--cell-size) items-center justify-center text-center">{children}</div>
		</td>
	)
}

export { Calendar, CalendarDayButton }
