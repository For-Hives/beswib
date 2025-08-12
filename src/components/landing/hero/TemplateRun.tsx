'use client'

import { useThemeStore } from '@/hooks/useTheme'
import Image from 'next/image'

export default function TemplateRun() {
	const { theme } = useThemeStore()
	return (
		<div className="">
			<Image
				alt="template-run"
				className="pointer-events-none z-30 -scale-x-100 overflow-visible object-cover object-bottom pt-36 dark:grayscale"
				fill
				unoptimized
				// size= 100vw in tablet and 80vw on phone
				sizes="100vw"
				src={theme === 'dark' ? '/landing/background_v4_white.webp' : '/landing/background_v4_dark.webp'}
			/>
		</div>
	)
}
