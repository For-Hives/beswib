import PaypalC2C from '@/components/paypal/paypal-c2c'

export default function PaypalPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold">PayPal Integration Demo</h1>
				<p className="mt-2 text-gray-600">Test the PayPal marketplace functionality</p>
			</div>

			<PaypalC2C />
		</div>
	)
}
