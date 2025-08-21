import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text, Tailwind } from '@react-email/components'

import { getTranslations } from '@/lib/i18n/dictionary'
import constantsLocales from '@/constants/locales.json'

import { Footer } from './Footer'

interface BeswibSaleAlertProps {
	sellerName?: string
	sellerEmail?: string
	buyerName?: string
	buyerEmail?: string
	eventName?: string
	bibPrice?: number
	platformFee?: number
	paypalFee?: number
	netRevenue?: number
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
	platformFee = 15,
	paypalFee = 5.5,
	paypalCaptureId = 'CAPTURE123',
	orderId = 'BW123456789',
	netRevenue = 135,
	eventName = 'Marathon de Paris 2024',
	eventLocation = 'Paris, France',
	eventDistance = '42.2 km',
	eventDate = '14 avril 2024',
	buyerName = 'Jean Martin',
	buyerEmail = 'jean@example.com',
	bibPrice = 150,
	bibCategory = 'Marathon',
	locale = 'fr',
}: BeswibSaleAlertProps) => {
	const t = getTranslations(locale, constantsLocales)
	const formatPrice = (price: number) => `${price.toFixed(2)}€`
	const conversionRate = bibPrice > 0 ? ((platformFee / bibPrice) * 100).toFixed(1) : '0.0'

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
							<Img src={`/beswib.png`} width="100" height="100" alt="Beswib" className="mx-auto" />
						</Section>

						{/* Card principale */}
						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
							{/* Header d'alerte */}
							<Section className="text-center">
								<Text className="text-warning mb-2 text-4xl">🚨</Text>
								<Heading className="text-foreground mb-2 text-2xl font-bold">
									{t.emails.saleAlert.title}
								</Heading>
								<Text className="text-muted-foreground text-base">{t.emails.saleAlert.subtitle}</Text>
								<Text className="text-muted-foreground text-sm">
									{saleTimestamp} • ID: {orderId}
								</Text>
							</Section>

							{/* Résumé financier */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									💰 {t.emails.saleAlert.financialSummary}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleAlert.salePrice}:
										</Text>
										<Text className="text-foreground text-sm font-bold">{formatPrice(bibPrice)}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleAlert.platformFee} ({conversionRate}%):
										</Text>
										<Text className="text-success text-sm font-bold">+{formatPrice(platformFee)}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleAlert.paypalFee}:
										</Text>
										<Text className="text-foreground text-sm">-{formatPrice(paypalFee || 0)}</Text>
									</Section>

									<Section className="border-border mt-3 border-t pt-3">
										<Section className="flex justify-between">
											<Text className="text-foreground text-base font-bold">
												{t.emails.saleAlert.netRevenue}:
											</Text>
											<Text className="text-success text-lg font-bold">{formatPrice(platformFee)}</Text>
										</Section>
									</Section>
								</Section>
							</Section>

							{/* Détails de la vente */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									📋 {t.emails.saleAlert.saleDetails}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleAlert.event}:
										</Text>
										<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleAlert.category}:
										</Text>
										<Text className="text-foreground text-sm">{bibCategory}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleAlert.distance}:
										</Text>
										<Text className="text-foreground text-sm">{eventDistance}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleAlert.date}:
										</Text>
										<Text className="text-foreground text-sm">{eventDate}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleAlert.location}:
										</Text>
										<Text className="text-foreground text-sm">{eventLocation}</Text>
									</Section>

									<Section className="mt-3 flex justify-between">
										<Text className="text-muted-foreground text-sm font-medium">
											{t.emails.saleAlert.orderId}:
										</Text>
										<Text className="text-foreground font-mono text-sm">{orderId}</Text>
									</Section>
								</Section>
							</Section>

							{/* Participants */}
							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									👥 {t.emails.saleAlert.participants}
								</Heading>

								<Section className="mb-4">
									<Text className="text-muted-foreground mb-1 text-sm font-medium">🏪 {t.emails.saleAlert.seller.toUpperCase()}</Text>
									<Text className="text-foreground text-sm font-semibold">{sellerName}</Text>
									<Text className="text-muted-foreground text-xs">{sellerEmail}</Text>
									<Text className="text-muted-foreground text-xs">{t.emails.saleAlert.totalReceived}: {formatPrice(netRevenue || 0)}</Text>
								</Section>

								<Section>
									<Text className="text-muted-foreground mb-1 text-sm font-medium">🏃‍♂️ {t.emails.saleAlert.buyer.toUpperCase()}</Text>
									<Text className="text-foreground text-sm font-semibold">{buyerName}</Text>
									<Text className="text-muted-foreground text-xs">{buyerEmail}</Text>
									<Text className="text-muted-foreground text-xs">{t.emails.saleAlert.salePrice}: {formatPrice(bibPrice)}</Text>
								</Section>
							</Section>

							{/* Données techniques */}
							<Section className="bg-card border-border mb-6 rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									🔧 {t.emails.saleAlert.technicalData}
								</Heading>

								<Section>
									<Section className="flex justify-between">
										<Text className="text-muted-foreground text-xs font-medium">
											{t.emails.saleAlert.orderId}:
										</Text>
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
										<Text className="text-muted-foreground text-xs font-medium">
											{t.emails.saleAlert.timestamp}:
										</Text>
										<Text className="text-foreground font-mono text-xs">{saleTimestamp}</Text>
									</Section>
								</Section>
							</Section>

							{/* Actions rapides */}
							<Section className="bg-card border-border rounded-lg border p-6">
								<Heading className="text-foreground mb-4 text-lg font-semibold">
									{t.emails.saleAlert.quickActions}
								</Heading>
								<Section className="flex justify-center gap-4">
									<Link
										href={`${baseUrl}/admin/dashboard`}
										style={{
											backgroundColor: 'oklch(0.6231 0.188 259.8145)',
											color: 'oklch(1 0 0)',
											textDecoration: 'none',
											padding: '12px 24px',
											borderRadius: '8px',
											fontSize: '14px',
											fontWeight: '500',
											display: 'inline-block',
										}}
									>
										{t.emails.saleAlert.viewDashboard}
									</Link>
									<Link
										href={`${baseUrl}/admin/transactions`}
										style={{
											backgroundColor: 'oklch(0.985 0.0015 247.8)',
											color: 'oklch(0.46 0.02 264.36)',
											textDecoration: 'none',
											padding: '12px 24px',
											borderRadius: '8px',
											fontSize: '14px',
											fontWeight: '500',
											display: 'inline-block',
											border: '1px solid oklch(0.89 0.004 264.53)',
										}}
									>
										{t.emails.saleAlert.viewTransactions}
									</Link>
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
	platformFee: 15,
	paypalFee: 5.5,
	paypalCaptureId: 'CAPTURE123456789',
	orderId: 'BW123456789',
	netRevenue: 135,
	eventName: 'Marathon de Paris 2024',
	eventLocation: 'Paris, France',
	eventDistance: '42.2 km',
	eventDate: '14 avril 2024',
	buyerName: 'Jean Martin',
	buyerEmail: 'jean.martin@example.com',
	bibPrice: 150,
	bibCategory: 'Marathon',
	locale: 'fr',
} as BeswibSaleAlertProps

export default BeswibSaleAlert
