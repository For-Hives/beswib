'use client'

import { useScroll, useTransform, motion, useSpring, useMotionValueEvent, type MotionValue } from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'

interface TimelineEntry {
	title: string
	content: React.ReactNode
}

const TimelineItem = ({
	item,
	containerRef,
	lineHeight,
}: {
	item: TimelineEntry
	containerRef: React.RefObject<HTMLDivElement | null>
	lineHeight: MotionValue<number>
}) => {
	const itemRef = useRef<HTMLDivElement>(null)
	const { scrollYProgress } = useScroll({
		target: itemRef,
		offset: ['start 80%', 'start 30%'],
	})
	const titleOpacity = useTransform(scrollYProgress, [0, 1], [0.45, 1])
	const titleBgPosition = useTransform(scrollYProgress, [0, 1], ['0% 50%', '100% 50%'])

	const [anchorY, setAnchorY] = useState(0)
	const [isActive, setIsActive] = useState(false)

	useEffect(() => {
		const update = () => {
			if (!itemRef.current || !containerRef.current) return
			const itemTop = itemRef.current.getBoundingClientRect().top
			const containerTop = containerRef.current.getBoundingClientRect().top
			setAnchorY(itemTop - containerTop)
		}
		update()
		const ro = new ResizeObserver(update)
		if (itemRef.current) ro.observe(itemRef.current)
		if (containerRef.current) ro.observe(containerRef.current)
		window.addEventListener('resize', update)
		return () => {
			ro.disconnect()
			window.removeEventListener('resize', update)
		}
	}, [containerRef])

	useMotionValueEvent(lineHeight, 'change', v => {
		const activationOffset = 12 // trigger when the line reaches the dot center
		setIsActive(v >= anchorY - activationOffset)
	})

	return (
		<div ref={itemRef} className="flex justify-start pt-10 md:gap-10 md:pt-20">
			<div className="sticky top-40 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
				<div className="absolute left-3 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-50/70 ring-1 ring-neutral-200/60 md:left-3 dark:bg-neutral-900/60 dark:ring-neutral-700/60">
					<div
						className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-sky-400' : 'bg-neutral-300 dark:bg-neutral-700'}`}
					/>
				</div>
				<motion.h3
					style={{
						opacity: titleOpacity,
						backgroundPosition: titleBgPosition,
						backgroundSize: '200% 100%',
						backgroundRepeat: 'no-repeat',
					}}
					className={`hidden bg-clip-text text-xl font-bold text-transparent md:block md:pl-20 md:text-5xl ${isActive ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-sky-400' : 'bg-gradient-to-r from-purple-500 via-blue-500 to-neutral-400'}`}
				>
					{item.title}
				</motion.h3>
			</div>

			<div className="relative w-full pr-4 pl-20 md:pl-4">
				<motion.h3
					style={{
						opacity: titleOpacity,
						backgroundPosition: titleBgPosition,
						backgroundSize: '200% 100%',
						backgroundRepeat: 'no-repeat',
					}}
					className={`mb-4 block bg-clip-text text-left text-2xl font-bold text-transparent md:hidden ${isActive ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-sky-400' : 'bg-gradient-to-r from-purple-500 via-blue-500 to-neutral-400'}`}
				>
					{item.title}
				</motion.h3>
				{item.content}
			</div>
		</div>
	)
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
	const ref = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const [height, setHeight] = useState(0)

	useEffect(() => {
		if (!ref.current) return
		const el = ref.current
		const handleResize = () => setHeight(el.getBoundingClientRect().height)
		handleResize()
		const ro = new ResizeObserver(handleResize)
		ro.observe(el)
		return () => ro.disconnect()
	}, [])

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['start 10%', 'end 50%'],
	})

	// Smooth the scroll-driven progress for the line using a spring (ease-in-out feel)
	const springProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.8 })
	const heightTransform = useTransform(springProgress, [0, 1], [0, height])
	const opacityTransform = useTransform(springProgress, [0, 0.1], [0, 1])

	return (
		<div className="w-full font-sans md:px-10" ref={containerRef}>
			<div ref={ref} className="relative mx-auto max-w-full pb-20">
				{data.map(item => (
					<TimelineItem key={item.title} item={item} containerRef={ref} lineHeight={heightTransform} />
				))}
				<div
					style={{ height: height + 'px' }}
					className="absolute top-0 left-8 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8 dark:via-neutral-700"
				>
					<motion.div
						style={{ height: heightTransform, opacity: opacityTransform }}
						className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-purple-500 from-[0%] via-blue-500 via-[10%] to-transparent"
					/>
				</div>
			</div>
		</div>
	)
}
