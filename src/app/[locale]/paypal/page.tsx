import type { Locale } from '@/lib/i18n-config'

import PaypalC2C from '@/components/paypal/paypal-c2c'

interface PaypalPageProps {
	params: Promise<{ locale: Locale }>
}

export default async function PaypalPage({ params }: PaypalPageProps) {
	const { locale } = await params
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold">PayPal Integration Demo</h1>
				<p className="mt-2 text-gray-600">Test the PayPal marketplace functionality</p>
			</div>

			<PaypalC2C locale={locale} />
		</div>
	)
}
