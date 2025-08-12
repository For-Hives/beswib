'use client'

import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import CustomSignUp from '@/components/auth/CustomSignUp'
import AuthGuard from '@/components/auth/AuthGuard'

export default function Page() {
	return (
		<AuthGuard mode="guest-only">
			<AuthSplitScreen
				title="Créer un compte"
				subtitle="Rejoignez la communauté Beswib et commencez à échanger vos dossards."
			>
				<CustomSignUp />
			</AuthSplitScreen>
		</AuthGuard>
	)
}
