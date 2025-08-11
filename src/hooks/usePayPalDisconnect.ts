import { useMutation } from '@tanstack/react-query'

import { disconnectPayPalAccount } from '@/services/paypal-onboarding.services'

export function usePayPalDisconnect() {
	return useMutation({
		mutationFn: (userId: string) => disconnectPayPalAccount(userId),
	})
}
