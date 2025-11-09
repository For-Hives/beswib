import Link from 'next/link'
import mainLocales from '@/app/[locale]/locales.json'
import { getTranslations } from '@/lib/i18n/dictionary'

interface UnauthorizedPageProps {
	params: Promise<{ locale: string }>
}

export default async function UnauthorizedPage({ params }: UnauthorizedPageProps) {
	const { locale } = await params
	const t = getTranslations(locale, mainLocales).auth.unauthorized

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
			<div className="relative flex min-h-screen items-center justify-center p-6">
				<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md">
					{/* Error Icon */}
					<div className="mb-6 text-6xl text-red-600 dark:text-red-400">🚫</div>

					{/* Title */}
					<h1 className="text-foreground mb-4 text-3xl font-bold">{t.title}</h1>

					{/* Messages */}
					<div className="mb-6 space-y-3">
						<p className="text-muted-foreground text-lg">{t.description}</p>
						<p className="text-muted-foreground text-sm">{t.adminRequired}</p>
					</div>

					{/* Action buttons */}
					<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Link
							href="/"
							className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-md px-8 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							{t.backToHome}
						</Link>
						<Link
							href={`/${locale}/contact`}
							className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-md border px-8 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							{t.contactSupport}
						</Link>
					</div>

					{/* Additional help text */}
					<div className="border-border/30 mt-8 border-t pt-6">
						<p className="text-muted-foreground text-xs">{t.additionalHelp}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
