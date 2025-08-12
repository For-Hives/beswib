import { cn } from '@/lib/utils'

interface LoaderProps {
	size?: 'sm' | 'md' | 'lg'
	className?: string
	text?: string
	showText?: boolean
}

export default function Loader({ size = 'md', className, text, showText = false }: LoaderProps) {
	const sizeClasses = {
		sm: 'w-8 h-8',
		md: 'w-15 h-15',
		lg: 'w-20 h-20',
	}

	return (
		<div className={cn('flex flex-col items-center space-y-4', className)}>
			<div className={cn('relative', sizeClasses[size])}>
				<div
					className={cn(
						'absolute animate-spin rounded-full border-t-2 border-r-2 border-t-purple-600 border-r-transparent',
						sizeClasses[size]
					)}
					style={{
						animation: 'spin 0.8s linear infinite',
					}}
				/>
			</div>
			{showText && text && <p className="text-muted-foreground text-sm">{text}</p>}
		</div>
	)
}
