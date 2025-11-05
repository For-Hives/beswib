import { Column, Img, Link, Section, Text } from '@react-email/components'
import constantsLocales from '@/constants/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'

export const Footer = ({ locale, baseUrl }: { baseUrl: string; locale: string }) => {
	const t = getTranslations(locale, constantsLocales)

	// Safe access to translations with fallbacks
	const getSafeTranslation = (path: string, fallback: string): string => {
		try {
			const keys = path.split('.')
			let value: unknown = t
			for (const key of keys) {
				if (value != null && value !== undefined && typeof value === 'object' && key in value) {
					value = (value as Record<string, unknown>)[key]
				} else {
					return fallback
				}
			}
			return typeof value === 'string' ? value : fallback
		} catch {
			return fallback
		}
	}

	return (
		<>
			{/* Footer */}
			<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
				<Section className="text-center">
					<Link href={`${baseUrl}`} className="text-muted-foreground text-xs underline">
						{getSafeTranslation('emails.saleConfirmation.ourSite', 'beswib.com')}
					</Link>
					&nbsp;&nbsp;|&nbsp;&nbsp;
					<Link href={`${baseUrl}/contact`} className="text-muted-foreground text-xs underline">
						{getSafeTranslation('emails.saleConfirmation.contact', 'Contact')}
					</Link>
					&nbsp;&nbsp;|&nbsp;&nbsp;
					<Link href={`${baseUrl}/dashboard`} className="text-muted-foreground text-xs underline">
						{getSafeTranslation('emails.saleConfirmation.dashboard', 'Dashboard')}
					</Link>
					&nbsp;&nbsp;|&nbsp;&nbsp;
					<Link href={`${baseUrl}/legals/privacy`} className="text-muted-foreground text-xs underline">
						{getSafeTranslation('emails.saleConfirmation.privacy', 'Privacy')}
					</Link>
				</Section>

				<Section className="bg-card border-border mt-4 rounded-lg border shadow-sm">
					<Column style={{ width: '66%' }}>
						<Text className="text-muted-foreground text-xs">
							{getSafeTranslation('emails.layout.copyright', '© {year} Beswib. All rights reserved.').replace(
								'{year}',
								new Date().getFullYear().toString()
							)}
							<br />
							{getSafeTranslation('emails.saleConfirmation.tagline', 'Race bib marketplace platform.')}
						</Text>
					</Column>
					<Column align="right" className="mt-4 flex flex-row items-center justify-end gap-2">
						<Link href="https://www.instagram.com/beswib_official">
							<Img
								src={`${baseUrl}/mails/instagram.png`}
								width="24"
								height="24"
								alt="Instagram"
								className="opacity-80"
							/>
						</Link>
						<Link href="https://strava.app.link/3wlVkUjzlUb">
							<Img src={`${baseUrl}/mails/strava.png`} width="24" height="24" alt="Strava" className="opacity-80" />
						</Link>
						<Link href="https://www.linkedin.com/company/beswib">
							<Img src={`${baseUrl}/mails/linkedin.png`} width="24" height="24" alt="LinkedIn" className="opacity-80" />
						</Link>
						<Link href="https://www.facebook.com/beswib_official">
							<Img src={`${baseUrl}/mails/facebook.png`} width="24" height="24" alt="Facebook" className="opacity-80" />
						</Link>
					</Column>
				</Section>
			</Section>
		</>
	)
}
