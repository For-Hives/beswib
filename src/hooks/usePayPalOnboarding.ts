import { useMutation } from '@tanstack/react-query'

import { startPayPalOnboarding } from '@/app/[locale]/profile/actions'
import { track } from '@/lib/analytics/client'

export function usePayPalOnboarding() {
	return useMutation({
		onSuccess: result => {
			if (result.actionUrl ?? '') {
				// Open PayPal onboarding in a new window
				const openedWindow = window.open(result.actionUrl, '_blank', 'width=400,height=600')
				track('paypal_onboarding_open', { via: 'popup', popup_blocked: openedWindow == null })
			} else {
				track('paypal_onboarding_error', { kind: 'referral_failed' })
			}
		},
		onError: error => {
			console.error('PayPal onboarding error:', error)
			track('paypal_onboarding_error', { kind: 'request_failed' })
		},
		mutationFn: () => startPayPalOnboarding(),
	})
}
