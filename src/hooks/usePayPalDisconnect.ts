import { useMutation } from '@tanstack/react-query'

import { disconnectPayPal } from '@/app/[locale]/profile/actions'

export function usePayPalDisconnect() {
	return useMutation({
		mutationFn: () => disconnectPayPal(),
	})
}
