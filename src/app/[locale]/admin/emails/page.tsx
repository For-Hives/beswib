import { Metadata } from 'next'

import EmailTestClient from './EmailTestClient'

export const metadata: Metadata = {
	title: 'Test des emails - Admin Beswib',
	description: "Interface de test pour les templates d'emails",
}

export default function EmailTestPage() {
	return <EmailTestClient />
}
