/** biome-ignore-all lint/suspicious/noExplicitAny: <the usage is ok, we know that the variables are not used.> */
import { Body, Container, Head, Heading, Html, Img, Preview, Section, Tailwind, Text } from '@react-email/components'
import constantsLocales from '@/constants/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'
import { getFeeBreakdown } from '@/lib/utils/feeCalculations'

import { Footer } from './Footer'

interface BeswibSaleAlertProps {
	sellerName?: string
	sellerEmail?: string
	buyerName?: string
	buyerEmail?: string
	eventName?: string
	bibPrice?: number
	orderId?: string
	eventDate?: string
	eventLocation?: string
	eventDistance?: string
	bibCategory?: string
	transactionId?: string
	paypalCaptureId?: string
	saleTimestamp?: string
	locale?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

export const BeswibSaleAlert = ({
	transactionId = 'tx_abc123',
	sellerName = 'Marie Dupont',
	sellerEmail = 'marie@example.com',
	saleTimestamp = new Date().toLocaleString('fr-FR'),
	paypalCaptureId = 'CAPTURE123',
	orderId = 'BW123456789',
	locale = 'fr',
	buyerName = 'Jean Martin',
	buyerEmail = 'jean@example.com',
	bibPrice = 150,
}: BeswibSaleAlertProps) => {
	const t = getTranslations(locale, constantsLocales) as any // Safe cast - will error at runtime if translation missing
	const formatPrice = (price: number) => `${price.toFixed(2)}€`

	// Calculate fees dynamically using the utility functions
	const feeBreakdown = getFeeBreakdown(bibPrice)
	const { netAmount } = feeBreakdown

	return (
		<Html>
			<Head />
			<Tailwind
				config={{
					theme: {
						extend: {
							fontFamily: {
								sans: ['Geist', 'Arial', 'sans-serif'],
							},
							colors: {
								warning: 'oklch(0.838 0.199 83.87)',
								'success-foreground': 'oklch(0.972 0.027 138.27)',
								success: 'oklch(0.626 0.124 142.5)',
								'primary-foreground': 'oklch(1 0 0)',
								primary: 'oklch(0.6231 0.188 259.8145)',
								'muted-foreground': 'oklch(0.46 0.02 264.36)',
								muted: 'oklch(0.985 0.0015 247.8)',
								foreground: 'oklch(0.24 0 0)',
								destructive: 'oklch(0.576 0.196 27.33)',
								card: 'oklch(1 0 0)',
								border: 'oklch(0.89 0.004 264.53)',
								background: 'oklch(1 0 0)',
							},
						},
					},
				}}
			>
				<Body className="bg-background font-sans">
					<Preview>{t.emails.saleAlert.subject}</Preview>
					<Container className="mx-auto max-w-[600px] px-4 py-8">
						{/* Header avec logo */}
						<Section>
							<Img src={`${baseUrl}/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							{/* Header d'alerte */}
							<Section className="text-center">
								<Heading className="text-foreground mb-2 text-2xl font-bold">{t.emails.saleAlert.title}</Heading>
								<Text className="text-muted-foreground text-base">{t.emails.saleAlert.subtitle}</Text>
								<Text className="text-muted-foreground text-sm">
									{saleTimestamp} • ID: {orderId}
								</Text>
							</Section>

							{/* Participants */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									👥 {t.emails.saleAlert.participants}
								</Heading>

								<Section className="mb-4">
									<Text className="text-muted-foreground mb-1 text-sm font-medium">🏪 {t.emails.saleAlert.seller}</Text>
									<Text className="text-foreground text-sm font-semibold">{sellerName}</Text>
									<Text className="text-muted-foreground text-xs">{sellerEmail}</Text>
									<Text className="text-muted-foreground text-xs">
										{t.emails.saleAlert.totalReceived}: {formatPrice(netAmount)}
									</Text>
								</Section>

								<Section>
									<Text className="text-muted-foreground mb-1 text-sm font-medium">🏃‍♂️ {t.emails.saleAlert.buyer}</Text>
									<Text className="text-foreground text-sm font-semibold">{buyerName}</Text>
									<Text className="text-muted-foreground text-xs">{buyerEmail}</Text>
									<Text className="text-muted-foreground text-xs">
										{t.emails.saleAlert.salePrice}: {formatPrice(bibPrice)}
									</Text>
								</Section>
							</Section>

							{/* Données techniques */}
							<Section className="bg-card border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									🔧 {t.emails.saleAlert.technicalData}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-xs font-medium">{t.emails.saleAlert.orderId}:</Text>
										<Text className="text-foreground font-mono text-xs">{orderId}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-xs font-medium">
											{t.emails.saleAlert.transactionId}:
										</Text>
										<Text className="text-foreground font-mono text-xs">{transactionId}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-xs font-medium">
											{t.emails.saleAlert.paypalCaptureId}:
										</Text>
										<Text className="text-foreground font-mono text-xs">{paypalCaptureId}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-xs font-medium">{t.emails.saleAlert.timestamp}:</Text>
										<Text className="text-muted-foreground font-mono text-xs">{saleTimestamp}</Text>
									</Section>
								</Section>
							</Section>
						</Section>

						{/* Footer admin */}
						<Section className="bg-card border-border mt-6 rounded-lg border px-8 py-4 shadow-sm">
							<Section className="text-center">
								<Text className="text-muted-foreground text-xs">
									{t.emails.saleAlert.adminFooter.replace('{year}', new Date().getFullYear().toString())}
									<br />
									{t.emails.saleAlert.adminNotice}
								</Text>
							</Section>
						</Section>

						{/* Footer standard */}
						<Footer locale={locale} baseUrl={baseUrl} />
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

BeswibSaleAlert.PreviewProps = {
	transactionId: 'tx_abc123def',
	sellerName: 'Marie Dupont',
	sellerEmail: 'marie.dupont@example.com',
	saleTimestamp: new Date().toLocaleString('fr-FR'),
	paypalCaptureId: 'CAPTURE123456789',
	orderId: 'BW123456789',
	locale: 'fr',
	eventName: 'Marathon de Paris 2024',
	eventLocation: 'Paris, France',
	eventDistance: '42.2 km',
	eventDate: '14 avril 2024',
	buyerName: 'Jean Martin',
	buyerEmail: 'jean.martin@example.com',
	bibPrice: 150,
	bibCategory: 'Marathon',
} as BeswibSaleAlertProps

export default BeswibSaleAlert
