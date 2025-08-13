'use client'

import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import CustomSignUp from '@/components/auth/CustomSignUp'
import AuthGuard from '@/components/auth/AuthGuard'

export default function Page() {
	return (
		<AuthGuard mode="guest-only">
			<AuthSplitScreen>
				<CustomSignUp />
			</AuthSplitScreen>
		</AuthGuard>
	)
}
