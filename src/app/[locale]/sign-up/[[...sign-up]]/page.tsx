'use client'

import AuthSplitScreen from '@/components/ui/AuthSplitScreen'
import CustomSignUp from '@/components/auth/CustomSignUp'

export default function Page() {
	return (
		<AuthSplitScreen
			title="Créer un compte"
			subtitle="Rejoignez la communauté Beswib et commencez à échanger vos dossards."
		>
			<CustomSignUp />
		</AuthSplitScreen>
	)
}
