import { forwardRef } from 'react'

import Image, { ImageProps } from 'next/image'

interface OptimizedImageProps extends Omit<ImageProps, 'width' | 'height'> {
	width: number
	height: number
	aspectRatio?: string
	className?: string
}

/**
 * Optimized Image component that always includes proper width and height attributes
 * to prevent Cumulative Layout Shift (CLS) issues identified by Screaming Frog
 */
const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
	({ width, height, className = '', aspectRatio, alt, ...props }, ref) => {
		// Ensure alt text is provided for accessibility
		const altText = alt ?? 'Image'

		// Combine aspect ratio styles if provided
		const combinedClassName =
			aspectRatio !== undefined && aspectRatio.length > 0 ? `${className} [aspect-ratio:${aspectRatio}]` : className

		return (
			<Image
				ref={ref}
				width={width}
				height={height}
				alt={altText}
				className={combinedClassName}
				// Ensure loading optimization
				loading={props.priority === true ? undefined : 'lazy'}
				// Add decoding hint for better performance
				decoding="async"
				{...props}
			/>
		)
	}
)

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage
