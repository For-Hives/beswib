'use client'

import { SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import CustomSignIn from '@/components/auth/CustomSignIn'

export default function Page() {
	return (
		<>
			<SignedOut>
				<AuthSplitScreen>
					<CustomSignIn />
				</AuthSplitScreen>
			</SignedOut>
			<RedirectToSignIn />
		</>
	)
}
