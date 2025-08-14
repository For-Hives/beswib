import Link from 'next/link'

import { SOCIALS, InstagramIcon, LinkedinIcon, StravaIcon } from '@/lib/utils/social'
import { LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'

import LanguageSelector from './LanguageSelector'
import translations from './locales.json'

export default async function Footer({ localeParams }: Readonly<{ localeParams: Promise<LocaleParams> }>) {
	const { locale } = await localeParams

	const t = getTranslations(locale, translations)

	return (
		<footer className="row-start-3 mt-10 border-t p-6">
			<div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:justify-between">
				{/* Brand and socials */}
				<div className="flex flex-col gap-4">
					<p className="text-muted-foreground text-sm">
						{t.footer.madeWith} ❤️ {t.footer.by}{' '}
						<Link className="underline" href="https://forhives.fr/" target="_blank" rel="noopener noreferrer">
							ForHives
						</Link>
					</p>
					<div className="flex items-center gap-3">
						<Link
							href={SOCIALS.linkedin}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Twitter"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							<LinkedinIcon className="h-5 w-5" />
						</Link>
						<Link
							href={SOCIALS.instagram}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="X"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							<InstagramIcon className="h-5 w-5" />
						</Link>
						<Link
							href={SOCIALS.strava}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Facebook"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							<StravaIcon className="h-5 w-5" />
						</Link>
					</div>
				</div>

				{/* Explore */}
				<nav className="grid grid-cols-2 gap-8 sm:grid-cols-3">
					<div>
						<h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
							{t.footer.sections?.explore ?? 'Explore'}
						</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/marketplace`}>
									{t.navbar.marketplaceLink}
								</Link>
							</li>
							<li>
								<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/events`}>
									{t.navbar.racesLink}
								</Link>
							</li>
							<li>
								<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/faq`}>
									{t.navbar.faqLink}
								</Link>
							</li>
							<li>
								<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/contact`}>
									{t.navbar.contactLink}
								</Link>
							</li>
						</ul>
					</div>
					{/* Legal */}
					<div>
						<h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
							{t.footer.sections?.legal ?? 'Legal'}
						</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/legals/legal-notice`}>
									{t.footer.links?.legalNotice ?? 'Legal Notice'}
								</Link>
							</li>
							<li>
								<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/legals/privacy-policy`}>
									{t.footer.links?.privacy ?? 'Privacy Policy'}
								</Link>
							</li>
							<li>
								<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/legals/terms`}>
									{t.footer.links?.terms ?? 'Terms of Service'}
								</Link>
							</li>
						</ul>
					</div>

					{/* Language */}
					<div>
						<h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
							{t.footer.selectLanguage}
						</h3>
						<LanguageSelector currentLocale={locale} />
					</div>
				</nav>
			</div>
		</footer>
	)
}
