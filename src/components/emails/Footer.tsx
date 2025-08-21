import { Column, Img, Link, Section, Text } from '@react-email/components'

import { getTranslations } from '@/lib/i18n/dictionary'
import constantsLocales from '@/constants/locales.json'

export const Footer = ({ locale, baseUrl }: { baseUrl: string; locale: string }) => {
	const t = getTranslations(locale, constantsLocales)

	return (
		<>
			{/* Footer */}
			<Section className="bg-card border-border rounded-lg border px-8 py-6 shadow-sm">
				<Section className="text-center">
					<Link href={`${baseUrl}`} className="text-muted-foreground text-xs underline">
						{t.emails.saleConfirmation.ourSite}
					</Link>
					&nbsp;&nbsp;|&nbsp;&nbsp;
					<Link href={`${baseUrl}/contact`} className="text-muted-foreground text-xs underline">
						{t.emails.saleConfirmation.contact}
					</Link>
					&nbsp;&nbsp;|&nbsp;&nbsp;
					<Link href={`${baseUrl}/dashboard`} className="text-muted-foreground text-xs underline">
						{t.emails.saleConfirmation.dashboard}
					</Link>
					&nbsp;&nbsp;|&nbsp;&nbsp;
					<Link href={`${baseUrl}/legals/privacy`} className="text-muted-foreground text-xs underline">
						{t.emails.saleConfirmation.privacy}
					</Link>
				</Section>

				<Section className="bg-card border-border mt-4 rounded-lg border shadow-sm">
					<Column style={{ width: '66%' }}>
						<Text className="text-muted-foreground text-xs">
							{t.emails.layout.copyright.replace('{year}', new Date().getFullYear().toString())}
							<br />
							{t.emails.saleConfirmation.tagline}
						</Text>
					</Column>
					<Column align="right" className="mt-4 flex flex-row items-center justify-end gap-2">
						<Link href="https://www.instagram.com/beswib_official">
							<Img src={`/mails/instagram.png`} width="24" height="24" alt="Instagram" className="opacity-80" />
						</Link>
						<Link href="https://strava.app.link/3wlVkUjzlUb">
							<Img src={`/mails/strava.png`} width="24" height="24" alt="Strava" className="opacity-80" />
						</Link>
						<Link href="https://www.linkedin.com/company/beswib">
							<Img src={`/mails/linkedin.png`} width="24" height="24" alt="LinkedIn" className="opacity-80" />
						</Link>
					</Column>
				</Section>
			</Section>
		</>
	)
}
