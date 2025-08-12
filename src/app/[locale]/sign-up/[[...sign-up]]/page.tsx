'use client'

import { SignUp } from '@clerk/nextjs'
import { useClerkTheme } from '@/hooks/useClerkTheme'
import AuthSplitScreen from '@/components/ui/AuthSplitScreen'

export default function Page() {
	const { appearance } = useClerkTheme()

	return (
		<AuthSplitScreen
			title="Créer un compte"
			subtitle="Rejoignez la communauté Beswib et commencez à échanger vos dossards."
		>
			<SignUp appearance={appearance} />
		</AuthSplitScreen>
	)
}
