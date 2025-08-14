'use client'

import { SignedOut, RedirectToSignIn } from '@clerk/nextjs'

import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import CustomSignUp from '@/components/auth/CustomSignUp'

export default function Page() {
	return (
		<>
			<SignedOut>
				<AuthSplitScreen>
					<CustomSignUp />
				</AuthSplitScreen>
			</SignedOut>
			<RedirectToSignIn />
		</>
	)
}
