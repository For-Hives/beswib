'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

interface ProcessLoaderProps {
	isLoading: boolean
	totalSteps?: number
	currentStep?: number
	message?: string
}

export default function ProcessLoader({ isLoading, totalSteps = 10, currentStep = 0, message }: ProcessLoaderProps) {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		if (isLoading) {
			// Calculate progress percentage
			const percentage = Math.min(Math.round((currentStep / totalSteps) * 100), 100)
			setProgress(percentage)
		} else {
			setProgress(0)
		}
	}, [isLoading, currentStep, totalSteps])

	if (!isLoading) return null

	return (
		<div className="fixed bottom-6 right-6 z-50 w-80 rounded-lg border border-border bg-card p-4 shadow-lg">
			<div className="flex items-center gap-3 mb-3">
				<Loader2 className="h-5 w-5 animate-spin text-primary" />
				<span className="text-sm font-medium text-foreground">
					{message || 'Processing...'}
				</span>
			</div>
			<Progress value={progress} className="h-2" />
			<p className="mt-2 text-xs text-muted-foreground text-right">
				{progress}%
			</p>
		</div>
	)
}

