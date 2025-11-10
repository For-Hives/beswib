'use client'

import { useInView } from 'framer-motion'
import React from 'react'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'

interface LazyImageProps {
	alt: string
	AspectRatioClassName?: string
	className?: string
	/** URL of the fallback image. default: undefined */
	fallback?: string
	/** Whether the image should only load when it is in view. default: false */
	inView?: boolean
	/** The ratio of the image. */
	ratio: number
	src: string
}

export function LazyImage({
	alt,
	AspectRatioClassName,
	className,
	fallback,
	inView = false,
	ratio,
	src,
}: LazyImageProps) {
	const ref = React.useRef<HTMLDivElement | null>(null)
	const imgRef = React.useRef<HTMLImageElement | null>(null)
	const isInView = useInView(ref, { once: true })

	const [imgSrc, setImgSrc] = React.useState<string | undefined>(inView ? undefined : src)
	const [isLoading, setIsLoading] = React.useState(true)

	const handleError = () => {
		if (fallback) {
			setImgSrc(fallback)
		}
		setIsLoading(false)
	}

	const handleLoad = () => {
		setIsLoading(false)
	}

	// Load image only when inView
	React.useEffect(() => {
		if (inView && isInView && !imgSrc) {
			setImgSrc(src)
		}
	}, [inView, isInView, src, imgSrc])

	// Handle cached images instantly
	React.useEffect(() => {
		if (imgRef.current?.complete) {
			handleLoad()
		}
	}, [imgSrc])

	return (
		<AspectRatio
			ref={ref}
			ratio={ratio}
			className={cn('relative size-full overflow-hidden rounded-lg border', AspectRatioClassName)}
		>
			{/* Skeleton / fallback */}
			<div
				className={cn(
					'bg-accent/30 absolute inset-0 animate-pulse rounded-lg transition-opacity will-change-[opacity]',
					{ 'opacity-0': !isLoading }
				)}
			/>

			{imgSrc && (
				// biome-ignore lint/performance/noImgElement: Custom lazy loading implementation
				<img
					ref={imgRef}
					alt={alt}
					className={cn(
						'size-full rounded-lg object-cover opacity-0 transition-opacity duration-2000 will-change-[opacity]',
						{
							'opacity-100': !isLoading,
						},
						className
					)}
					decoding="async"
					fetchPriority={inView ? 'high' : 'low'}
					loading="lazy"
					src={imgSrc}
					onError={handleError}
					onLoad={handleLoad}
				/>
			)}
		</AspectRatio>
	)
}
