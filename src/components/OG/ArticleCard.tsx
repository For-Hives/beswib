/** biome-ignore-all lint/performance/noImgElement: <that's normal, we are in an opengraph image environment, we can't use the Image component> */
import blogTranslations from '@/components/blog/locales.json'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { pb } from '@/lib/services/pocketbase'
import { formatDateWithLocale } from '@/lib/utils/date'
import type { Article } from '@/models/article.model'
import type { ImageWithAlt } from '@/models/imageWithAlt.model'

interface ArticleCardProps {
	article: Article & { expand?: { image?: ImageWithAlt } }
	locale: Locale
	readTime: number
	host: string
	protocol: string
}

export default function ArticleCard({ article, locale, readTime, host, protocol }: Readonly<ArticleCardProps>) {
	const t = getTranslations(locale, blogTranslations)

	console.log('article', article)
	// Get article image URL - convert to absolute URL for OG image environment
	let imageUrl: string | null = null
	if (article.expand?.image?.image) {
		const relativeUrl = pb.files.getURL(article.expand.image, article.expand.image.image)
		// Convert relative URL to absolute URL
		imageUrl = relativeUrl.startsWith('http') ? relativeUrl : `${protocol}://${host}${relativeUrl}`
		console.log('imageUrl', imageUrl)
	}

	return (
		<div
			style={{
				width: '280px',
				transform: 'rotate(3deg)',
				position: 'relative',
				overflow: 'hidden',
				height: '380px',
				flexDirection: 'column',
				display: 'flex',
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				borderRadius: '16px',
				border: '1px solid #e5e7eb',
				backgroundColor: '#fff',
			}}
		>
			{/* Image container */}
			<div
				style={{
					position: 'relative',
					margin: '16px',
					justifyContent: 'center',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={article.expand?.image?.alt || article.title}
						style={{
							width: '100%',
							objectPosition: 'center',
							objectFit: 'cover',
							height: '160px',
							borderRadius: '12px',
						}}
					/>
				) : (
					<div
						style={{
							width: '100%',
							height: '160px',
							borderRadius: '12px',
							backgroundColor: '#f3f4f6',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none">
							<path
								stroke="#9ca3af"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"
							/>
						</svg>
					</div>
				)}
			</div>

			{/* Content */}
			<div
				style={{
					padding: '0 16px 16px 16px',
					flexDirection: 'column',
					flex: 1,
					display: 'flex',
				}}
			>
				{/* Title */}
				<div
					style={{
						marginBottom: '12px',
						lineHeight: 1.3,
						fontWeight: 'bold',
						fontSize: '16px',
						fontFamily: 'Geist',
						display: 'flex',
						color: '#111827',
						height: '65px',
						overflow: 'hidden',
					}}
				>
					{article.title}
				</div>

				{/* Extract/Description */}
				{article.extract && (
					<div
						style={{
							marginBottom: '12px',
							lineHeight: 1.4,
							fontSize: '12px',
							fontFamily: 'Geist',
							display: 'flex',
							color: '#6b7280',
							height: '50px',
							overflow: 'hidden',
						}}
					>
						{article.extract.substring(0, 100)}
						{article.extract.length > 100 ? '...' : ''}
					</div>
				)}

				{/* Article details */}
				<div
					style={{
						gap: '8px',
						flexDirection: 'column',
						display: 'flex',
						marginTop: 'auto',
					}}
				>
					{/* Published date */}
					<div
						style={{
							gap: '8px',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
							<path
								stroke="#6b7280"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M3 9h18M7 3v2m10-2v2M6 13h2m-2 4h2m3-4h2m-2 4h2m3-4h2m-2 4h2M6.2 21h11.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 19.48 21 18.92 21 17.8V8.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C19.48 5 18.92 5 17.8 5H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 6.52 3 7.08 3 8.2v9.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 21 5.08 21 6.2 21"
							/>
						</svg>
						<div
							style={{
								fontSize: '11px',
								fontFamily: 'Geist',
								display: 'flex',
								color: '#6b7280',
							}}
						>
							{formatDateWithLocale(new Date(article.created), locale)}
						</div>
					</div>

					{/* Read time */}
					<div
						style={{
							gap: '8px',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="2" />
							<path d="M12 6v6l4 2" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
						</svg>
						<div
							style={{
								fontSize: '11px',
								fontFamily: 'Geist',
								display: 'flex',
								color: '#6b7280',
							}}
						>
							{readTime} {t.blog.readTime}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
