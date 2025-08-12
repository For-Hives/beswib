'use client'

import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import CustomSignIn from '@/components/auth/CustomSignIn'
import AuthGuard from '@/components/auth/AuthGuard'

export default function Page() {
	return (
		<AuthGuard mode="guest-only">
			<AuthSplitScreen>
				<CustomSignIn />
			</AuthSplitScreen>
		</AuthGuard>
	)
}
