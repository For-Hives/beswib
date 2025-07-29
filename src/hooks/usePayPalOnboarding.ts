import { useMutation, useQueryClient } from '@tanstack/react-query'

import { initiatePayPalOnboarding } from '@/services/paypal-onboarding.services'

export function usePayPalOnboarding() {
	const queryClient = useQueryClient()

	return useMutation({
		onSuccess: (result, userId) => {
			if (result.actionUrl) {
				// Open PayPal onboarding in a new window
				window.open(result.actionUrl, '_blank', 'width=400,height=600')
			}
		},
		onError: error => {
			console.error('PayPal onboarding error:', error)
		},
		mutationFn: (userId: string) => initiatePayPalOnboarding(userId),
	})
}
