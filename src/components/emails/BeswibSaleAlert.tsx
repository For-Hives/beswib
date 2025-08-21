// import {
// 	Body,
// 	Container,
// 	Head,
// 	Heading,
// 	Html,
// 	Img,
// 	Link,
// 	Preview,
// 	Section,
// 	Text,
// 	Tailwind,
// 	Column,
// 	Row,
// } from '@react-email/components'

// interface BeswibSaleAlertProps {
// 	sellerName?: string
// 	sellerEmail?: string
// 	buyerName?: string
// 	buyerEmail?: string
// 	eventName?: string
// 	bibPrice?: number
// 	platformFee?: number
// 	netRevenue?: number
// 	orderId?: string
// 	eventDate?: string
// 	eventLocation?: string
// 	eventDistance?: string
// 	bibCategory?: string
// 	transactionId?: string
// 	paypalCaptureId?: string
// 	saleTimestamp?: string
// }

// const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beswib.com'

// export const BeswibSaleAlert = ({
// 	transactionId = 'tx_abc123',
// 	sellerName = 'Marie Dupont',
// 	sellerEmail = 'marie@example.com',
// 	saleTimestamp = new Date().toLocaleString('fr-FR'),
// 	platformFee = 15,
// 	paypalCaptureId = 'CAPTURE123',
// 	orderId = 'BW123456789',
// 	netRevenue = 135,
// 	eventName = 'Marathon de Paris 2024',
// 	eventLocation = 'Paris, France',
// 	eventDistance = '42.2 km',
// 	eventDate = '14 avril 2024',
// 	buyerName = 'Jean Martin',
// 	buyerEmail = 'jean@example.com',
// 	bibPrice = 150,
// 	bibCategory = 'Marathon',
// }: BeswibSaleAlertProps) => {
// 	const formatPrice = (price: number) => `${price.toFixed(2)}€`
// 	const conversionRate = bibPrice > 0 ? ((platformFee / bibPrice) * 100).toFixed(1) : '0.0'

// 	return (
// 		<Html>
// 			<Head />
// 			<Tailwind
// 				config={{
// 					theme: {
// 						extend: {
// 							fontFamily: {
// 								sans: ['Geist', 'Arial', 'sans-serif'],
// 							},
// 							colors: {
// 								warning: 'oklch(0.838 0.199 83.87)',
// 								'success-foreground': 'oklch(0.972 0.027 138.27)',
// 								success: 'oklch(0.626 0.124 142.5)',
// 								'primary-foreground': 'oklch(1 0 0)',
// 								primary: 'oklch(0.6231 0.188 259.8145)',
// 								'muted-foreground': 'oklch(0.46 0.02 264.36)',
// 								muted: 'oklch(0.985 0.0015 247.8)',
// 								foreground: 'oklch(0.24 0 0)',
// 								destructive: 'oklch(0.576 0.196 27.33)',
// 								card: 'oklch(1 0 0)',
// 								border: 'oklch(0.89 0.004 264.53)',
// 								background: 'oklch(1 0 0)',
// 							},
// 						},
// 					},
// 				}}
// 			>
// 				<Body className="bg-background font-sans">
// 					<Preview>
// 						🚨 Nouvelle vente sur Beswib - {formatPrice(bibPrice)} - {eventName}
// 					</Preview>
// 					<Container className="mx-auto max-w-[600px] px-4 py-8">
// 						{/* Header avec logo */}
// 						<Section className="mb-8">
// 							<Row>
// 								<Column align="center">
// 									<Img src={`/beswib.png`} width="80" height="80" alt="Beswib" />
// 								</Column>
// 							</Row>
// 						</Section>

// 						{/* Card principale */}
// 						<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
// 							{/* Header d'alerte */}
// 							<Section className="mb-6 text-center">
// 								<Text className="text-warning mb-2 text-4xl">🚨</Text>
// 								<Heading className="text-foreground mb-2 text-2xl font-bold">Nouvelle Vente Confirmée</Heading>
// 								<Text className="text-muted-foreground text-sm">
// 									{saleTimestamp} • ID: {orderId}
// 								</Text>
// 							</Section>

// 							{/* Résumé financier - en premier pour les admins */}
// 							<Section className="bg-success-foreground border-success/20 mb-6 rounded-lg border-2 p-6">
// 								<Heading className="text-foreground mb-4 text-lg font-semibold">💰 Résumé Financier</Heading>

// 								<Row className="mb-3">
// 									<Column style={{ width: '60%' }}>
// 										<Text className="text-muted-foreground text-sm font-medium">Prix de vente:</Text>
// 									</Column>
// 									<Column align="right" style={{ width: '40%' }}>
// 										<Text className="text-foreground text-sm font-bold">{formatPrice(bibPrice)}</Text>
// 									</Column>
// 								</Row>

// 								<Row className="mb-3">
// 									<Column style={{ width: '60%' }}>
// 										<Text className="text-muted-foreground text-sm font-medium">
// 											Commission Beswib ({conversionRate}%):
// 										</Text>
// 									</Column>
// 									<Column align="right" style={{ width: '40%' }}>
// 										<Text className="text-success text-sm font-bold">+{formatPrice(platformFee)}</Text>
// 									</Column>
// 								</Row>

// 								<Row className="border-border border-t pt-3">
// 									<Column style={{ width: '60%' }}>
// 										<Text className="text-foreground text-base font-bold">Revenu Net Plateforme:</Text>
// 									</Column>
// 									<Column align="right" style={{ width: '40%' }}>
// 										<Text className="text-success text-lg font-bold">{formatPrice(platformFee)}</Text>
// 									</Column>
// 								</Row>
// 							</Section>

// 							{/* Détails de la transaction */}
// 							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
// 								<Heading className="text-foreground mb-4 text-lg font-semibold">📋 Détails de la Transaction</Heading>

// 								<Section className="grid grid-cols-1 gap-3">
// 									<Row className="mb-2">
// 										<Column style={{ width: '30%' }}>
// 											<Text className="text-muted-foreground text-sm font-medium">Événement:</Text>
// 										</Column>
// 										<Column style={{ width: '70%' }}>
// 											<Text className="text-foreground text-sm font-semibold">{eventName}</Text>
// 										</Column>
// 									</Row>

// 									<Row className="mb-2">
// 										<Column style={{ width: '30%' }}>
// 											<Text className="text-muted-foreground text-sm font-medium">Catégorie:</Text>
// 										</Column>
// 										<Column style={{ width: '70%' }}>
// 											<Text className="text-foreground text-sm">
// 												{bibCategory} • {eventDistance}
// 											</Text>
// 										</Column>
// 									</Row>

// 									<Row className="mb-2">
// 										<Column style={{ width: '30%' }}>
// 											<Text className="text-muted-foreground text-sm font-medium">Date/Lieu:</Text>
// 										</Column>
// 										<Column style={{ width: '70%' }}>
// 											<Text className="text-foreground text-sm">
// 												{eventDate} • {eventLocation}
// 											</Text>
// 										</Column>
// 									</Row>
// 								</Section>
// 							</Section>

// 							{/* Informations des utilisateurs */}
// 							<Section className="bg-muted border-border mb-6 rounded-lg border p-6">
// 								<Heading className="text-foreground mb-4 text-lg font-semibold">
// 									👥 Participants à la Transaction
// 								</Heading>

// 								<Section className="mb-4">
// 									<Text className="text-muted-foreground mb-1 text-sm font-medium">🏪 VENDEUR</Text>
// 									<Text className="text-foreground text-sm font-semibold">{sellerName}</Text>
// 									<Text className="text-muted-foreground text-xs">{sellerEmail}</Text>
// 									<Text className="text-muted-foreground text-xs">Recevra: {formatPrice(netRevenue)}</Text>
// 								</Section>

// 								<Section>
// 									<Text className="text-muted-foreground mb-1 text-sm font-medium">🏃‍♂️ ACHETEUR</Text>
// 									<Text className="text-foreground text-sm font-semibold">{buyerName}</Text>
// 									<Text className="text-muted-foreground text-xs">{buyerEmail}</Text>
// 									<Text className="text-muted-foreground text-xs">A payé: {formatPrice(bibPrice)}</Text>
// 								</Section>
// 							</Section>

// 							{/* Données techniques */}
// 							<Section className="bg-card border-border rounded-lg border p-6">
// 								<Heading className="text-foreground mb-4 text-lg font-semibold">🔧 Données Techniques</Heading>

// 								<Section className="space-y-2">
// 									<Row>
// 										<Column style={{ width: '35%' }}>
// 											<Text className="text-muted-foreground text-xs font-medium">ID Commande:</Text>
// 										</Column>
// 										<Column style={{ width: '65%' }}>
// 											<Text className="text-foreground font-mono text-xs">{orderId}</Text>
// 										</Column>
// 									</Row>

// 									<Row>
// 										<Column style={{ width: '35%' }}>
// 											<Text className="text-muted-foreground text-xs font-medium">ID Transaction:</Text>
// 										</Column>
// 										<Column style={{ width: '65%' }}>
// 											<Text className="text-foreground font-mono text-xs">{transactionId}</Text>
// 										</Column>
// 									</Row>

// 									<Row>
// 										<Column style={{ width: '35%' }}>
// 											<Text className="text-muted-foreground text-xs font-medium">PayPal Capture:</Text>
// 										</Column>
// 										<Column style={{ width: '65%' }}>
// 											<Text className="text-foreground font-mono text-xs">{paypalCaptureId}</Text>
// 										</Column>
// 									</Row>
// 								</Section>
// 							</Section>

// 							{/* Actions rapides */}
// 							<Section className="mt-6 text-center">
// 								<Text className="text-muted-foreground mb-4 text-sm">Actions Rapides</Text>
// 								<Section className="flex flex-row justify-center gap-4">
// 									<Link
// 										href={`${baseUrl}/admin/dashboard`}
// 										className="bg-primary text-primary-foreground inline-block rounded-lg px-4 py-2 text-sm font-medium no-underline"
// 									>
// 										Voir Dashboard
// 									</Link>
// 									<Link
// 										href={`${baseUrl}/admin/transactions`}
// 										className="bg-muted text-muted-foreground inline-block rounded-lg border px-4 py-2 text-sm font-medium no-underline"
// 									>
// 										Transactions
// 									</Link>
// 								</Section>
// 							</Section>
// 						</Section>

// 						{/* Footer admin */}
// 						<Section className="bg-card border-border mt-6 rounded-lg border px-8 py-4 shadow-sm">
// 							<Section className="text-center">
// 								<Text className="text-muted-foreground text-xs">
// 									🤖 Alerte automatique générée par Beswib • {new Date().getFullYear()}
// 									<br />
// 									Email destiné exclusivement à l'équipe administrative
// 								</Text>
// 							</Section>
// 						</Section>
// 					</Container>
// 				</Body>
// 			</Tailwind>
// 		</Html>
// 	)
// }

// BeswibSaleAlert.PreviewProps = {
// 	transactionId: 'tx_abc123def',
// 	sellerName: 'Marie Dupont',
// 	sellerEmail: 'marie.dupont@example.com',
// 	saleTimestamp: new Date().toLocaleString('fr-FR'),
// 	platformFee: 15,
// 	paypalCaptureId: 'CAPTURE123456789',
// 	orderId: 'BW123456789',
// 	netRevenue: 135,
// 	eventName: 'Marathon de Paris 2024',
// 	eventLocation: 'Paris, France',
// 	eventDistance: '42.2 km',
// 	eventDate: '14 avril 2024',
// 	buyerName: 'Jean Martin',
// 	buyerEmail: 'jean.martin@example.com',
// 	bibPrice: 150,
// 	bibCategory: 'Marathon',
// } as BeswibSaleAlertProps

// export default BeswibSaleAlert
