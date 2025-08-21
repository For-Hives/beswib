import Head from 'next/head'

interface SocialMetaProps {
  title: string
  description: string
  image: string
  url: string
  locale: string
  type?: 'website' | 'article' | 'event'
  twitterHandle?: string
  facebookAppId?: string
}

export default function SocialMeta({
  title,
  description,
  image,
  url,
  locale,
  type = 'website',
  twitterHandle = '@beswib',
  facebookAppId
}: SocialMetaProps) {
  return (
    <Head>
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Beswib" />
      
      {/* Facebook App ID */}
      {facebookAppId && (
        <meta property="fb:app_id" content={facebookAppId} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      
      {/* LinkedIn */}
      <meta property="og:image:secure_url" content={image} />
      
      {/* Pinterest */}
      <meta name="pinterest-rich-pin" content="true" />
      
      {/* WhatsApp */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Discord */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Telegram */}
      <meta property="og:image:type" content="image/jpeg" />
    </Head>
  )
}

// Composant spécialisé pour les événements
export function EventSocialMeta({
  eventName,
  eventDescription,
  eventImage,
  eventUrl,
  locale,
  eventDate,
  eventLocation
}: {
  eventName: string
  eventDescription: string
  eventImage: string
  eventUrl: string
  locale: string
  eventDate: string
  eventLocation: string
}) {
  const title = `${eventName} | Beswib`
  const description = `${eventDescription} - ${eventLocation} - ${eventDate}`
  
  return (
    <Head>
      {/* Open Graph pour événements */}
      <meta property="og:type" content="event" />
      <meta property="og:url" content={eventUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={eventImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={eventName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Beswib" />
      
      {/* Métadonnées d'événement */}
      <meta property="event:start_time" content={eventDate} />
      <meta property="event:end_time" content={eventDate} />
      <meta property="event:location" content={eventLocation} />
      <meta property="event:type" content="sports_event" />
      
      {/* Twitter pour événements */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={eventUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={eventImage} />
      <meta name="twitter:image:alt" content={eventName} />
      <meta name="twitter:site" content="@beswib" />
      <meta name="twitter:creator" content="@beswib" />
    </Head>
  )
}

// Composant pour les articles/blog
export function ArticleSocialMeta({
  title,
  description,
  image,
  url,
  locale,
  author,
  publishedTime,
  modifiedTime,
  tags
}: {
  title: string
  description: string
  image: string
  url: string
  locale: string
  author: string
  publishedTime: string
  modifiedTime?: string
  tags?: string[]
}) {
  return (
    <Head>
      {/* Open Graph pour articles */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Beswib" />
      
      {/* Métadonnées d'article */}
      <meta property="article:author" content={author} />
      <meta property="article:published_time" content={publishedTime} />
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {tags && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter pour articles */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@beswib" />
      <meta name="twitter:creator" content="@beswib" />
    </Head>
  )
}