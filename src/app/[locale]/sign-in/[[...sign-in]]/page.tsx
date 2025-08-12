'use client'

import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import CustomSignIn from '@/components/auth/CustomSignIn'

export default function Page() {
	return (
		<AuthSplitScreen>
			<CustomSignIn />
		</AuthSplitScreen>
	)
}
