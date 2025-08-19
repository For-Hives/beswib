import { useQuery } from '@tanstack/react-query'

import type { PayPalMerchantIntegrationStatus } from '@/models/paypal.model'

export function usePayPalMerchantStatus(userId: string | null | undefined) {
	return useQuery({
		// Fetch once on mount; only refresh manually via refetch()
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchInterval: false,
		queryKey: ['paypal-merchant-status', userId],
		queryFn: async () => {
			if (userId == null || userId === '') return null
			const res = await fetch(`/api/paypal/merchant-status?userId=${encodeURIComponent(userId)}`)
			if (!res.ok) throw new Error('Failed to fetch PayPal status')
			const data = (await res.json()) as { status?: PayPalMerchantIntegrationStatus }
			return data.status ?? null
		},
		enabled: userId != null && userId !== '',
	})
}
