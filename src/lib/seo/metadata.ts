import type { Metadata } from 'next'

// Types pour les métadonnées SEO
export interface SEOData {
	title: string
	description: string
	keywords: string[]
	ogTitle?: string
	ogDescription?: string
	ogImage?: string
	canonical?: string
}

// Données SEO par langue et par page
export const seoData: Record<string, Record<string, SEOData>> = {
	// Page d'accueil
	home: {
		en: {
			title: 'Beswib - Race Bib Transfer Marketplace | Running, Trail, Triathlon',
			description: 'Secure marketplace for race bib transfers in running, trail running, triathlon, and cycling. Buy or sell race bibs legally with PayPal protection. Find your next race or resell your bib safely.',
			keywords: [
				'race bib transfer',
				'bib resale',
				'running bib',
				'trail running bib',
				'triathlon bib',
				'cycling bib',
				'marathon bib',
				'race registration transfer',
				'bib marketplace',
				'race ticket resale'
			],
			ogTitle: 'Beswib - The Safe Way to Transfer Race Bibs',
			ogDescription: 'Join thousands of athletes buying and selling race bibs securely. Transfer your bib or find a spot in sold-out races.'
		},
		fr: {
			title: 'Beswib - Marketplace de revente de dossards | Course à pied, Trail, Triathlon',
			description: 'Plateforme sécurisée de revente de dossards pour courses de running, trail, triathlon et cyclisme. Revendez ou achetez des dossards en toute légalité avec protection PayPal.',
			keywords: [
				'dossard course',
				'revente dossard',
				'course à pied',
				'trail running',
				'triathlon',
				'cyclisme',
				'marathon',
				'transfert dossard',
				'marketplace sport',
				'bib running'
			],
			ogTitle: 'Beswib - Revendez ou achetez vos dossards en toute sécurité',
			ogDescription: 'Rejoignez des milliers d\'athlètes qui achètent et vendent leurs dossards en toute sécurité. Transférez votre dossard ou trouvez une place dans une course complète.'
		},
		es: {
			title: 'Beswib - Marketplace de dorsales de carreras | Running, Trail, Triatlón',
			description: 'Plataforma segura para la reventa de dorsales de carreras de running, trail, triatlón y ciclismo. Vende o compra dorsales legalmente con protección PayPal.',
			keywords: [
				'dorsal carrera',
				'reventa dorsal',
				'running',
				'trail running',
				'triatlón',
				'ciclismo',
				'maratón',
				'transferencia dorsal',
				'marketplace deportivo',
				'bib running'
			],
			ogTitle: 'Beswib - La forma segura de transferir dorsales de carreras',
			ogDescription: 'Únete a miles de atletas que compran y venden dorsales de forma segura. Transfiere tu dorsal o encuentra un lugar en carreras agotadas.'
		},
		it: {
			title: 'Beswib - Marketplace pettorali gara | Running, Trail, Triathlon',
			description: 'Piattaforma sicura per la rivendita di pettorali per gare di running, trail, triathlon e ciclismo. Vendi o acquista pettorali legalmente con protezione PayPal.',
			keywords: [
				'pettorale gara',
				'rivendita pettorale',
				'running',
				'trail running',
				'triathlon',
				'ciclismo',
				'maratona',
				'trasferimento pettorale',
				'marketplace sportivo',
				'bib running'
			],
			ogTitle: 'Beswib - Il modo sicuro per trasferire pettorali di gara',
			ogDescription: 'Unisciti a migliaia di atleti che comprano e vendono pettorali in sicurezza. Trasferisci il tuo pettorale o trova un posto in gare sold-out.'
		},
		de: {
			title: 'Beswib - Startnummern-Marktplatz | Laufen, Trail, Triathlon',
			description: 'Sichere Plattform für den Verkauf von Startnummern für Lauf-, Trail-, Triathlon- und Radrennen. Verkaufen oder kaufen Sie Startnummern legal mit PayPal-Schutz.',
			keywords: [
				'Startnummer',
				'Startnummernverkauf',
				'Laufen',
				'Trailrunning',
				'Triathlon',
				'Radfahren',
				'Marathon',
				'Startnummerntransfer',
				'Sport-Marktplatz',
				'bib running'
			],
			ogTitle: 'Beswib - Der sichere Weg zum Startnummern-Transfer',
			ogDescription: 'Treten Sie Tausenden von Athleten bei, die sicher Startnummern kaufen und verkaufen. Transferieren Sie Ihre Startnummer oder finden Sie einen Platz bei ausverkauften Rennen.'
		},
		pt: {
			title: 'Beswib - Marketplace de números de peito | Corrida, Trail, Triathlon',
			description: 'Plataforma segura para revenda de números de peito para corridas de running, trail, triathlon e ciclismo. Venda ou compre números legalmente com proteção PayPal.',
			keywords: [
				'número peito',
				'revenda número',
				'corrida',
				'trail running',
				'triathlon',
				'ciclismo',
				'maratona',
				'transferência número',
				'marketplace esporte',
				'bib running'
			],
			ogTitle: 'Beswib - A forma segura de transferir números de peito',
			ogDescription: 'Junte-se a milhares de atletas comprando e vendendo números de peito com segurança. Transfira seu número ou encontre uma vaga em corridas esgotadas.'
		},
		nl: {
			title: 'Beswib - Wedstrijdnummer Marketplace | Hardlopen, Trail, Triathlon',
			description: 'Veilig platform voor de verkoop van wedstrijdnummer voor hardloop-, trail-, triathlon- en fietswedstrijden. Verkoop of koop nummers legaal met PayPal-bescherming.',
			keywords: [
				'wedstrijdnummer',
				'nummer verkoop',
				'hardlopen',
				'trailrunning',
				'triathlon',
				'fietsen',
				'marathon',
				'nummer transfer',
				'sport marketplace',
				'bib running'
			],
			ogTitle: 'Beswib - De veilige manier om wedstrijdnumers over te dragen',
			ogDescription: 'Sluit je aan bij duizenden atleten die veilig wedstrijdnumers kopen en verkopen. Draag je nummer over of vind een plek in uitverkochte wedstrijden.'
		},
		ko: {
			title: 'Beswib - 레이스 번호판 마켓플레이스 | 달리기, 트레일, 트라이애슬론',
			description: '러닝, 트레일, 트라이애슬론, 사이클링 대회 번호판 재판매를 위한 안전한 플랫폼. PayPal 보호로 번호판을 합법적으로 판매 또는 구매하세요.',
			keywords: [
				'레이스 번호판',
				'번호판 재판매',
				'러닝',
				'트레일 러닝',
				'트라이애슬론',
				'사이클링',
				'마라톤',
				'번호판 양도',
				'스포츠 마켓플레이스',
				'bib running'
			],
			ogTitle: 'Beswib - 레이스 번호판을 안전하게 양도하는 방법',
			ogDescription: '수천 명의 선수들과 함께 안전하게 번호판을 사고 파세요. 번호판을 양도하거나 매진된 대회에서 자리를 찾으세요.'
		},
		ro: {
			title: 'Beswib - Marketplace numere concurs | Alergare, Trail, Triatlon',
			description: 'Platformă sigură pentru revânzarea numerelor de concurs pentru alergare, trail, triatlon și ciclism. Vindeți sau cumpărați numere legal cu protecție PayPal.',
			keywords: [
				'număr concurs',
				'revânzare număr',
				'alergare',
				'trail running',
				'triatlon',
				'ciclism',
				'maraton',
				'transfer număr',
				'marketplace sport',
				'bib running'
			],
			ogTitle: 'Beswib - Modul sigur de transfer al numerelor de concurs',
			ogDescription: 'Alăturați-vă miilor de sportivi care cumpără și vând numere în siguranță. Transferați-vă numărul sau găsiți un loc la concursurile sold-out.'
		}
	},
	// Page événements
	events: {
		en: {
			title: 'Find Race Events & Buy Bibs | Beswib',
			description: 'Browse upcoming running, trail, triathlon, and cycling events. Find available bibs for sale or discover events to participate in.',
			keywords: [
				'upcoming races',
				'running events',
				'trail events',
				'triathlon events',
				'cycling events',
				'bib for sale',
				'race calendar',
				'marathon events',
				'sport events calendar',
				'bib marketplace'
			],
			ogTitle: 'Find Your Next Race Event | Beswib',
			ogDescription: 'Browse thousands of upcoming races and find available bibs for sale. Your next adventure starts here.'
		},
		fr: {
			title: 'Trouvez des événements de course et achetez des dossards | Beswib',
			description: 'Parcourez les événements à venir de course à pied, trail, triathlon et cyclisme. Trouvez des dossards disponibles à la vente ou découvrez des événements.',
			keywords: [
				'événements course',
				'courses à venir',
				'événements running',
				'événements trail',
				'événements triathlon',
				'événements cyclisme',
				'dossard en vente',
				'calendrier courses',
				'événements marathon',
				'calendrier sportif'
			],
			ogTitle: 'Trouvez votre prochaine course | Beswib',
			ogDescription: 'Parcourez des milliers de courses à venir et trouvez des dossards disponibles. Votre prochaine aventure commence ici.'
		},
		es: {
			title: 'Encuentra eventos de carreras y compra dorsales | Beswib',
			description: 'Navega por próximos eventos de running, trail, triatlón y ciclismo. Encuentra dorsales disponibles en venta o descubre eventos para participar.',
			keywords: [
				'eventos carrera',
				'carreras próximas',
				'eventos running',
				'eventos trail',
				'eventos triatlón',
				'eventos ciclismo',
				'dorsal en venta',
				'calendario carreras',
				'eventos maratón',
				'calendario deportivo'
			],
			ogTitle: 'Encuentra tu próxima carrera | Beswib',
			ogDescription: 'Navega por miles de carreras próximas y encuentra dorsales disponibles. Tu próxima aventura comienza aquí.'
		},
		it: {
			title: 'Trova eventi di gara e acquista pettorali | Beswib',
			description: 'Sfoglia prossimi eventi di running, trail, triathlon e ciclismo. Trova pettorali disponibili in vendita o scopri eventi a cui partecipare.',
			keywords: [
				'eventi gara',
				'gare prossime',
				'eventi running',
				'eventi trail',
				'eventi triathlon',
				'eventi ciclismo',
				'pettorale in vendita',
				'calendario gare',
				'eventi maratona',
				'calendario sportivo'
			],
			ogTitle: 'Trova la tua prossima gara | Beswib',
			ogDescription: 'Sfoglia migliaia di gare prossime e trova pettorali disponibili. La tua prossima avventura inizia qui.'
		},
		de: {
			title: 'Rennveranstaltungen finden und Startnummern kaufen | Beswib',
			description: 'Durchsuchen Sie bevorstehende Lauf-, Trail-, Triathlon- und Radrennveranstaltungen. Finden Sie verfügbare Startnummern zum Verkauf oder entdecken Sie Veranstaltungen.',
			keywords: [
				'Wettkampfveranstaltungen',
				'bevorstehende Rennen',
				'Laufveranstaltungen',
				'Trailveranstaltungen',
				'Triathlonveranstaltungen',
				'Radveranstaltungen',
				'Startnummer zum Verkauf',
				'Wettkampfkalender',
				'Marathonveranstaltungen',
				'Sportkalender'
			],
			ogTitle: 'Finden Sie Ihr nächstes Rennen | Beswib',
			ogDescription: 'Durchsuchen Sie Tausende bevorstehende Rennen und finden Sie verfügbare Startnummern. Ihr nächstes Abenteuer beginnt hier.'
		},
		pt: {
			title: 'Encontre eventos de corrida e compre números | Beswib',
			description: 'Navegue por próximos eventos de corrida, trail, triathlon e ciclismo. Encontre números disponíveis à venda ou descubra eventos para participar.',
			keywords: [
				'eventos corrida',
				'corridas próximas',
				'eventos running',
				'eventos trail',
				'eventos triathlon',
				'eventos ciclismo',
				'número à venda',
				'calendário corridas',
				'eventos maratona',
				'calendário esporte'
			],
			ogTitle: 'Encontre sua próxima corrida | Beswib',
			ogDescription: 'Navegue por milhares de corridas próximas e encontre números disponíveis. Sua próxima aventura começa aqui.'
		},
		nl: {
			title: 'Vind wedstrijd evenementen en koop nummers | Beswib',
			description: 'Blader door komende hardloop-, trail-, triathlon- en fietswedstrijden. Vind beschikbare nummers te koop of ontdek evenementen om aan deel te nemen.',
			keywords: [
				'wedstrijd evenementen',
				'aankomende wedstrijden',
				'hardloopevenementen',
				'trailevenementen',
				'triathlonevenementen',
				'fietsevenementen',
				'nummer te koop',
				'wedstrijd kalender',
				'marathonevenementen',
				'sportkalender'
			],
			ogTitle: 'Vind je volgende wedstrijd | Beswib',
			ogDescription: 'Blader door duizenden aankomende wedstrijden en vind beschikbare nummers. Je volgende avontuur begint hier.'
		},
		ko: {
			title: '레이스 이벤트 찾기 및 번호판 구매 | Beswib',
			description: '다가오는 러닝, 트레일, 트라이애슬론, 사이클링 이벤트를 둘러보세요. 판매 가능한 번호판을 찾거나 참가할 이벤트를 발견하세요.',
			keywords: [
				'레이스 이벤트',
				'다가오는 레이스',
				'러닝 이벤트',
				'트레일 이벤트',
				'트라이애슬론 이벤트',
				'사이클링 이벤트',
				'번호판 판매',
				'레이스 캘린더',
				'마라톤 이벤트',
				'스포츠 캘린더'
			],
			ogTitle: '다음 레이스 찾기 | Beswib',
			ogDescription: '수천 개의 다가오는 레이스를 둘러보고 판매 가능한 번호판을 찾으세요. 당신의 다음 모험이 여기서 시작됩니다.'
		},
		ro: {
			title: 'Găsiți evenimente de concurs și cumpărați numere | Beswib',
			description: 'Răsfoiți evenimentele viitoare de alergare, trail, triatlon și ciclism. Găsiți numere disponibile de vânzare sau descoperiți evenimente la care să participați.',
			keywords: [
				'evenimente concurs',
				'concursuri viitoare',
				'evenimente alergare',
				'evenimente trail',
				'evenimente triatlon',
				'evenimente ciclism',
				'număr de vânzare',
				'calendari concursuri',
				'evenimente maraton',
				'calendari sportiv'
			],
			ogTitle: 'Găsiți următorul dvs. concurs | Beswib',
			ogDescription: 'Răsfoiți mii de concursuri viitoare și găsiți numere disponibile. Următoarea dvs. aventură începe aici.'
		}
	},
	// Page marketplace
	marketplace: {
		en: {
			title: 'Browse & Buy Race Bibs for Sale | Beswib Marketplace',
			description: 'Find race bibs for sale from verified sellers. Browse by sport, location, and price. Secure transactions with PayPal protection.',
			keywords: [
				'bibs for sale',
				'race bib marketplace',
				'buy race bib',
				'running bib sale',
				'trail bib sale',
				'triathlon bib sale',
				'cycling bib sale',
				'bib resale',
				'race ticket resale',
				'secondhand bib'
			],
			ogTitle: 'Browse Race Bibs for Sale | Beswib Marketplace',
			ogDescription: 'Find perfect race bibs for your next event. Secure marketplace with verified sellers and PayPal protection.'
		},
		fr: {
			title: 'Parcourez et achetez des dossards en vente | Marketplace Beswib',
			description: 'Trouvez des dossards en vente par des vendeurs vérifiés. Parcourez par sport, lieu et prix. Transactions sécurisées avec protection PayPal.',
			keywords: [
				'dossards en vente',
				'marketplace dossard',
				'acheter dossard',
				'vente dossard running',
				'vente dossard trail',
				'vente dossard triathlon',
				'vente dossard cyclisme',
				'revente dossard',
				'revente billet course',
				'dossard occasion'
			],
			ogTitle: 'Parcourez les dossards en vente | Marketplace Beswib',
			ogDescription: 'Trouvez le dossard parfait pour votre prochain événement. Marketplace sécurisé avec vendeurs vérifiés et protection PayPal.'
		},
		es: {
			title: 'Navega y compra dorsales en venta | Marketplace Beswib',
			description: 'Encuentra dorsales en venta de vendedores verificados. Navega por deporte, ubicación y precio. Transacciones seguras con protección PayPal.',
			keywords: [
				'dorsales en venta',
				'marketplace dorsal',
				'comprar dorsal',
				'venta dorsal running',
				'venta dorsal trail',
				'venta dorsal triathlon',
				'venta dorsal ciclismo',
				'reventa dorsal',
				'reventa entrada carrera',
				'dorsal segunda mano'
			],
			ogTitle: 'Navega dorsales en venta | Marketplace Beswib',
			ogDescription: 'Encuentra dorsales perfectos para tu próximo evento. Marketplace seguro con vendedores verificados y protección PayPal.'
		},
		it: {
			title: 'Sfoglia e acquista pettorali in vendita | Marketplace Beswib',
			description: 'Trova pettorali in vendita da venditori verificati. Sfoglia per sport, località e prezzo. Transazioni sicure con protezione PayPal.',
			keywords: [
				'pettorali in vendita',
				'marketplace pettorale',
				'acquistare pettorale',
				'vendita pettorale running',
				'vendita pettorale trail',
				'vendita pettorale triathlon',
				'vendita pettorale ciclismo',
				'rivendita pettorale',
				'rivendita biglietto gara',
				'pettorale usato'
			],
			ogTitle: 'Sfoglia pettorali in vendita | Marketplace Beswib',
			ogDescription: 'Trova pettorali perfetti per il tuo prossimo evento. Marketplace sicuro con venditori verificati e protezione PayPal.'
		},
		de: {
			title: 'Startnummern zum Verkauf durchsuchen und kaufen | Beswib Marketplace',
			description: 'Finden Sie Startnummern zum Verkauf von verifizierten Verkäufern. Suchen Sie nach Sportart, Standort und Preis. Sichere Transaktionen mit PayPal-Schutz.',
			keywords: [
				'Startnummern zum Verkauf',
				'Startnummern-Marktplatz',
				'Startnummer kaufen',
				'Startnummer Verkauf Laufen',
				'Startnummer Verkauf Trail',
				'Startnummer Verkauf Triathlon',
				'Startnummer Verkauf Radfahren',
				'Startnummer Wiederverkauf',
				'Kartenwiederverkauf Rennen',
				'gebrauchte Startnummer'
			],
			ogTitle: 'Startnummern zum Verkauf durchsuchen | Beswib Marketplace',
			ogDescription: 'Finden Sie perfekte Startnummern für Ihre nächste Veranstaltung. Sicherer Marktplatz mit verifizierten Verkäufern und PayPal-Schutz.'
		},
		pt: {
			title: 'Navegue e compre números à venda | Marketplace Beswib',
			description: 'Encontre números à venda de vendedores verificados. Navegue por esporte, localização e preço. Transações seguras com proteção PayPal.',
			keywords: [
				'números à venda',
				'marketplace número',
				'comprar número',
				'venda número corrida',
				'venda número trail',
				'venda número triathlon',
				'venda número ciclismo',
				'revenda número',
				'revenda ingresso corrida',
				'número usado'
			],
			ogTitle: 'Navegue números à venda | Marketplace Beswib',
			ogDescription: 'Encontre números perfeitos para seu próximo evento. Marketplace seguro com vendedores verificados e proteção PayPal.'
		},
		nl: {
			title: 'Blader en koop wedstrijd nummers te koop | Beswib Marketplace',
			description: 'Vind wedstrijd nummers te koop van geverifieerde verkopers. Blader op sport, locatie en prijs. Veilige transacties met PayPal-bescherming.',
			keywords: [
				'nummers te koop',
				'wedstrijdnummer marketplace',
				'wedstrijdnummer kopen',
				'wedstrijdnummer verkoop hardlopen',
				'wedstrijdnummer verkoop trail',
				'wedstrijdnummer verkoop triathlon',
				'wedstrijdnummer verkoop fietsen',
				'wedstrijdnummer wederverkoop',
				'wedstrijd ticket wederverkoop',
				'tweedehands nummer'
			],
			ogTitle: 'Blader wedstrijd nummers te koop | Beswib Marketplace',
			ogDescription: 'Vind perfecte wedstrijd nummers voor je volgende evenement. Veilige marketplace met geverifieerde verkopers en PayPal-bescherming.'
		},
		ko: {
			title: '판매 중인 번호판 둘러보기 및 구매 | Beswib 마켓플레이스',
			description: '검증된 판매자로부터 판매 중인 번호판을 찾아보세요. 스포츠, 위치, 가격별로 둘러보세요. PayPal 보호로 안전한 거래.',
			keywords: [
				'번호판 판매',
				'번호판 마켓플레이스',
				'번호판 구매',
				'러닝 번호판 판매',
				'트레일 번호판 판매',
				'트라이애슬론 번호판 판매',
				'사이클링 번호판 판매',
				'번호판 재판매',
				'레이스 티켓 재판매',
				'중고 번호판'
			],
			ogTitle: '판매 중인 번호판 둘러보기 | Beswib 마켓플레이스',
			ogDescription: '다음 이벤트에 완벽한 번호판을 찾으세요. 검증된 판매자와 PayPal 보호로 안전한 마켓플레이스.'
		},
		ro: {
			title: 'Răsfoiți și cumpărați numere de concurs de vânzare | Marketplace Beswib',
			description: 'Găsiți numere de concurs de vânzare de la vânzători verificați. Răsfoiți după sport, locație și preț. Tranzacții sigure cu protecție PayPal.',
			keywords: [
				'numere de vânzare',
				'marketplace numere',
				'cumpara numar',
				'vanzare numar alergare',
				'vanzare numar trail',
				'vanzare numar triatlon',
				'vanzare numar ciclism',
				'revanzare numar',
				'revanzare bilet concurs',
				'numar second-hand'
			],
			ogTitle: 'Răsfoiți numere de concurs de vânzare | Marketplace Beswib',
			ogDescription: 'Găsiți numere perfecte pentru următorul dvs. eveniment. Marketplace sigur cu vânzători verificați și protecție PayPal.'
		}
	}
}

// Fonction pour générer les métadonnées SEO
export function generateSEOData(page: string, locale: string): SEOData | null {
	if (!seoData[page] || !seoData[page][locale]) {
		return null
	}
	return seoData[page][locale]
}

// Fonction pour générer les métadonnées Next.js
export function generateMetadata(page: string, locale: string): Metadata {
	const seo = generateSEOData(page, locale)

	if (!seo) {
		return {
			title: 'Beswib - Race Bib Transfer Marketplace',
			description: 'Secure marketplace for race bib transfers in running, trail running, triathlon, and cycling.',
		}
	}

	const baseUrl = 'https://beswib.com'
	const canonicalUrl = `${baseUrl}/${locale}${page === 'home' ? '' : `/${page}`}`

	return {
		title: seo.title,
		description: seo.description,
		keywords: seo.keywords.join(', '),
		alternates: {
			canonical: canonicalUrl,
		},
		openGraph: {
			title: seo.ogTitle || seo.title,
			description: seo.ogDescription || seo.description,
			url: canonicalUrl,
			siteName: 'Beswib',
			images: [
				{
					url: seo.ogImage || '/og-image.jpg',
					width: 1200,
					height: 630,
					alt: seo.ogTitle || seo.title,
				},
			],
			locale: getLocaleForOG(locale),
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title: seo.ogTitle || seo.title,
			description: seo.ogDescription || seo.description,
			images: [seo.ogImage || '/og-image.jpg'],
		},
	}
}

// Helper pour les locales Open Graph
function getLocaleForOG(locale: string): string {
	const localeMap: Record<string, string> = {
		en: 'en_US',
		fr: 'fr_FR',
		es: 'es_ES',
		it: 'it_IT',
		de: 'de_DE',
		pt: 'pt_PT',
		nl: 'nl_NL',
		ko: 'ko_KR',
		ro: 'ro_RO',
	}

	return localeMap[locale] || 'en_US'
}