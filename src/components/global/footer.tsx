import { ConsentDialogLink } from '@c15t/nextjs'
import Link from 'next/link'
import { TrackClick } from '@/components/analytics/TrackClick'
import { umamiAttrs } from '@/lib/analytics/attrs'
import { isDataFictional } from '@/lib/archive'
import type { LocaleParams } from '@/lib/generation/staticParams'
import { getTranslations } from '@/lib/i18n/dictionary'
import { FacebookIcon, InstagramIcon, LinkedinIcon, SOCIALS, StravaIcon } from '@/lib/utils/social'
import { getVersion } from '@/lib/utils/version'

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
						<Link
							className="underline"
							href="https://forhives.fr/"
							target="_blank"
							rel="noopener noreferrer"
							{...umamiAttrs('outbound_click', { target: 'forhives', where: 'footer' })}
						>
							ForHives
						</Link>
					</p>
					<p className="text-muted-foreground/80 text-xs">
						{t.archive.badge}
						{isDataFictional() && ` · ${t.archive.fictional}`}
					</p>
					<div className="flex items-center gap-3">
						<Link
							href={SOCIALS.linkedin}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="LinkedIn"
							{...umamiAttrs('outbound_click', { target: 'linkedin', where: 'footer' })}
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							<LinkedinIcon className="h-5 w-5" />
						</Link>
						<Link
							href={SOCIALS.instagram}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Instagram"
							{...umamiAttrs('outbound_click', { target: 'instagram', where: 'footer' })}
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							<InstagramIcon className="h-5 w-5" />
						</Link>
						<Link
							href={SOCIALS.strava}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Strava"
							{...umamiAttrs('outbound_click', { target: 'strava', where: 'footer' })}
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							<StravaIcon className="h-5 w-5" />
						</Link>
						<Link
							href={SOCIALS.facebook}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Facebook"
							{...umamiAttrs('outbound_click', { target: 'facebook', where: 'footer' })}
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							<FacebookIcon className="h-5 w-5" />
						</Link>
					</div>

					{/* version */}
					<div className="text-muted-foreground text-sm">{`${getVersion()}`}</div>
				</div>

				{/* Explore */}
				<nav className="grid grid-cols-2 gap-8 sm:grid-cols-3">
					<div>
						<h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
							{t.footer.sections?.explore ?? 'Explore'}
						</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<TrackClick name="nav_click" props={{ item: 'marketplace', where: 'footer' }}>
									<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/marketplace`}>
										{t.navbar.marketplaceLink}
									</Link>
								</TrackClick>
							</li>
							<li>
								<TrackClick name="nav_click" props={{ item: 'events', where: 'footer' }}>
									<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/events`}>
										{t.navbar.racesLink}
									</Link>
								</TrackClick>
							</li>
							<li>
								<TrackClick name="nav_click" props={{ item: 'faq', where: 'footer' }}>
									<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/faq`}>
										{t.navbar.faqLink}
									</Link>
								</TrackClick>
							</li>
							<li>
								<TrackClick name="nav_click" props={{ item: 'contact', where: 'footer' }}>
									<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/contact`}>
										{t.navbar.contactLink}
									</Link>
								</TrackClick>
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
								<TrackClick name="nav_click" props={{ item: 'legal_notice', where: 'footer' }}>
									<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/legals/legal-notice`}>
										{t.footer.links?.legalNotice ?? 'Legal Notice'}
									</Link>
								</TrackClick>
							</li>
							<li>
								<TrackClick name="nav_click" props={{ item: 'privacy_policy', where: 'footer' }}>
									<Link
										className="text-muted-foreground hover:text-foreground"
										href={`/${locale}/legals/privacy-policy`}
									>
										{t.footer.links?.privacy ?? 'Privacy Policy'}
									</Link>
								</TrackClick>
							</li>
							<li>
								<TrackClick name="nav_click" props={{ item: 'terms', where: 'footer' }}>
									<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/legals/terms`}>
										{t.footer.links?.terms ?? 'Terms of Service'}
									</Link>
								</TrackClick>
							</li>
							<li>
								<TrackClick name="nav_click" props={{ item: 'data_deletion', where: 'footer' }}>
									<Link
										className="text-muted-foreground hover:text-foreground"
										href={`/${locale}/legals/data-deletion`}
									>
										{t.footer.links?.dataDeletion ?? 'Data Deletion'}
									</Link>
								</TrackClick>
							</li>
							<li>
								<TrackClick name="nav_click" props={{ item: 'aup', where: 'footer' }}>
									<Link className="text-muted-foreground hover:text-foreground" href={`/${locale}/legals/aup`}>
										{t.footer.links?.aup ?? 'Acceptable Use Policy'}
									</Link>
								</TrackClick>
							</li>
							{/* Reopens the consent preferences: the only way to give or withdraw consent once the banner is
							    gone. The button only exists after hydration: an invisible copy of its label, in the same
							    grid cell, keeps its place meanwhile, on two lines where the label wraps. */}
							<li className="grid">
								<span aria-hidden="true" className="invisible col-start-1 row-start-1">
									{t.footer.links?.cookieSettings ?? 'Cookie settings'}
								</span>
								<ConsentDialogLink className="text-muted-foreground hover:text-foreground col-start-1 row-start-1 text-left">
									{t.footer.links?.cookieSettings ?? 'Cookie settings'}
								</ConsentDialogLink>
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
