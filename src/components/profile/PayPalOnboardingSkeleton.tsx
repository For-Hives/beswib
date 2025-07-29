import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function PayPalOnboardingSkeleton() {
	return (
		<div className="space-y-6">
			{/* Status Overview Skeleton */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-6 w-24" />
					</div>
					<Skeleton className="h-4 w-64" />
				</CardHeader>
			</Card>

			{/* Onboarding Section Skeleton */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-4 w-80" />
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-10 w-full" />
				</CardContent>
			</Card>

			{/* Payment Testing Section Skeleton */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-4 w-72" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-20 w-full" />
				</CardContent>
			</Card>
		</div>
	)
}
