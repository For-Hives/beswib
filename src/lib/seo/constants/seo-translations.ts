// SEO keywords by language and category
export const SEO_KEYWORDS = {
	ro: {
		raceTypes: {
			triathlon: 'triatlon',
			trail: 'alergare pe trail',
			road: 'alergare pe șosea',
			other: 'altele',
			cycle: 'ciclism',
		},
		global: [
			'numere de start',
			'alergare',
			'trail running',
			'triatlon',
			'ciclism',
			'transfer număr',
			'cumpără număr',
			'vinde număr',
			'maraton',
			'ultra trail',
		],
		actions: {
			transfer: 'transferă',
			sell: 'vinde',
			participate: 'participă',
			buy: 'cumpără',
		},
	},
	pt: {
		raceTypes: {
			triathlon: 'triatlo',
			trail: 'trail running',
			road: 'corrida de estrada',
			other: 'outro',
			cycle: 'ciclismo',
		},
		global: [
			'peitos',
			'corrida',
			'trail running',
			'triatlo',
			'ciclismo',
			'transferência peito',
			'comprar peito',
			'vender peito',
			'maratona',
			'ultra trail',
		],
		actions: {
			transfer: 'transferir',
			sell: 'vender',
			participate: 'participar',
			buy: 'comprar',
		},
	},
	nl: {
		raceTypes: {
			triathlon: 'triatlon',
			trail: 'trail running',
			road: 'wegwedstrijd',
			other: 'anders',
			cycle: 'wielrennen',
		},
		global: [
			'startnummers',
			'hardlopen',
			'trail running',
			'triatlon',
			'wielrennen',
			'startnummer overdracht',
			'startnummer kopen',
			'startnummer verkopen',
			'marathon',
			'ultra trail',
		],
		actions: {
			transfer: 'overdragen',
			sell: 'verkopen',
			participate: 'deelnemen',
			buy: 'kopen',
		},
	},
	ko: {
		raceTypes: {
			triathlon: '트라이애슬론',
			trail: '트레일 러닝',
			road: '로드 러닝',
			other: '기타',
			cycle: '사이클링',
		},
		global: [
			'경주 번호',
			'러닝',
			'트레일 러닝',
			'트라이애슬론',
			'사이클링',
			'번호 이전',
			'번호 구매',
			'번호 판매',
			'마라톤',
			'울트라 트레일',
		],
		actions: {
			transfer: '이전',
			sell: '판매',
			participate: '참가',
			buy: '구매',
		},
	},
	it: {
		raceTypes: {
			triathlon: 'triathlon',
			trail: 'trail running',
			road: 'corsa su strada',
			other: 'altro',
			cycle: 'ciclismo',
		},
		global: [
			'pettorali',
			'corsa',
			'trail running',
			'triathlon',
			'ciclismo',
			'trasferimento pettorale',
			'comprare pettorale',
			'vendere pettorale',
			'maratona',
			'ultra trail',
		],
		actions: {
			transfer: 'trasferire',
			sell: 'vendere',
			participate: 'partecipare',
			buy: 'comprare',
		},
	},
	fr: {
		raceTypes: {
			triathlon: 'triathlon',
			trail: 'course de trail',
			road: 'course sur route',
			other: 'autre',
			cycle: 'cyclisme',
		},
		global: [
			'dossards',
			'course à pied',
			'trail running',
			'triathlon',
			'cyclisme',
			'transfert dossard',
			'acheter dossard',
			'vendre dossard',
			'marathon',
			'ultra trail',
		],
		actions: {
			transfer: 'transférer',
			sell: 'vendre',
			participate: 'participer',
			buy: 'acheter',
		},
	},
	es: {
		raceTypes: {
			triathlon: 'triatlón',
			trail: 'trail running',
			road: 'carrera en ruta',
			other: 'otro',
			cycle: 'ciclismo',
		},
		global: [
			'dorsales',
			'carrera a pie',
			'trail running',
			'triatlón',
			'ciclismo',
			'transferencia dorsal',
			'comprar dorsal',
			'vender dorsal',
			'maratón',
			'ultra trail',
		],
		actions: {
			transfer: 'transferir',
			sell: 'vender',
			participate: 'participar',
			buy: 'comprar',
		},
	},
	en: {
		raceTypes: {
			triathlon: 'triathlon',
			trail: 'trail running',
			road: 'road running',
			other: 'other',
			cycle: 'cycling',
		},
		global: [
			'race bibs',
			'running bibs',
			'trail running',
			'triathlon',
			'cycling',
			'race transfer',
			'buy bibs',
			'sell bibs',
			'marathon',
			'ultra trail',
		],
		actions: {
			transfer: 'transfer',
			sell: 'sell',
			participate: 'participate',
			buy: 'buy',
		},
	},
	de: {
		raceTypes: {
			triathlon: 'triathlon',
			trail: 'trail running',
			road: 'straßenlauf',
			other: 'andere',
			cycle: 'radfahren',
		},
		global: [
			'startnummern',
			'laufen',
			'trail running',
			'triathlon',
			'radfahren',
			'startnummer transfer',
			'startnummer kaufen',
			'startnummer verkaufen',
			'marathon',
			'ultra trail',
		],
		actions: {
			transfer: 'übertragen',
			sell: 'verkaufen',
			participate: 'teilnehmen',
			buy: 'kaufen',
		},
	},
} as const

// SEO titles templates by language
export const SEO_TITLES = {
	ro: {
		site: 'Beswib - Platformă Legală Transfer Numere Cursă',
		marketplace: 'Marketplace | Cumpără & Vinde Numere | Running, Trail, Triatlon',
		legal: (pageName: string) => `${pageName} | Informații Legale | Beswib Marketplace Numere`,
		home: 'Beswib | Transfer Sigur Numere Cursă | Cumpără & Vinde Running, Trail, Triatlon',
		eventWithLocation: (eventName: string, location: string) =>
			`${eventName} în ${location.split(',')[0]} | Numere de Cursă`,
		events: 'Explorează Evenimente Running | Găsește Numere Trail, Maraton, Triatlon | Beswib',
		event: (eventName: string) => `${eventName} | Transfer Numere | Cumpără & Vinde pe Beswib`,
	},
	pt: {
		site: 'Beswib - Plataforma Legal Transferência Dorsais',
		marketplace: 'Marketplace | Comprar & Vender Dorsais | Running, Trail, Triatlo',
		legal: (pageName: string) => `${pageName} | Informações Legais | Beswib Marketplace Dorsais`,
		home: 'Beswib | Transferência Segura Dorsais | Comprar & Vender Running, Trail, Triatlo',
		eventWithLocation: (eventName: string, location: string) =>
			`${eventName} em ${location.split(',')[0]} | Peitos de Corrida`,
		events: 'Explorar Eventos Running | Encontrar Dorsais Trail, Maratona, Triatlo | Beswib',
		event: (eventName: string) => `${eventName} | Transferência Dorsais | Comprar & Vender no Beswib`,
	},
	nl: {
		site: 'Beswib - Legale Startnummer Overdracht Platform',
		marketplace: 'Marketplace | Koop & Verkoop Startnummers | Hardlopen, Trail, Triatlon',
		legal: (pageName: string) => `${pageName} | Juridische Informatie | Beswib Startnummer Platform`,
		home: 'Beswib | Veilige Startnummer Overdracht | Koop & Verkoop Hardlopen, Trail, Triatlon',
		eventWithLocation: (eventName: string, location: string) =>
			`${eventName} in ${location.split(',')[0]} | Startnummers`,
		events: 'Bekijk Hardloop Evenementen | Vind Startnummers Trail, Marathon, Triatlon | Beswib',
		event: (eventName: string) => `${eventName} | Startnummer Overdracht | Koop & Verkoop op Beswib`,
	},
	ko: {
		site: 'Beswib - 합법적 경주 번호 이전',
		marketplace: '경주 번호 구매 & 판매 | 러닝, 트레일 | Beswib',
		legal: (pageName: string) => `${pageName} | 법적 | Beswib`,
		home: '경주 번호 이전 | 러닝, 트레일, 트라이애슬론 | Beswib',
		eventWithLocation: (eventName: string, location: string) =>
			`${eventName} 에서 ${location.split(',')[0]} | 경주 번호`,
		events: '러닝 이벤트 탐색 | 트레일, 마라톤, 트라이애슬론 경주 번호 찾기 | Beswib',
		event: (eventName: string) => `${eventName} | 경주 번호 이전 | Beswib에서 구매 & 판매`,
	},
	it: {
		site: 'Beswib - Trasferimento Legale Pettorali',
		marketplace: 'Compra & Vendi Pettorali | Running, Trail | Beswib',
		legal: (pageName: string) => `${pageName} | Legale | Beswib`,
		home: 'Trasferimento Pettorali | Running, Trail, Triathlon | Beswib',
		eventWithLocation: (eventName: string, location: string) =>
			`${eventName} a ${location.split(',')[0]} | Pettorali di Gara`,
		events: 'Esplora Eventi Running | Trova Pettorali Trail, Maratona, Triathlon | Beswib',
		event: (eventName: string) => `${eventName} | Trasferimento Pettorali | Compra & Vendi su Beswib`,
	},
	fr: {
		site: 'Beswib - Transfert Légal de Dossards',
		marketplace: 'Acheter & Vendre Dossards | Running, Trail | Beswib',
		legal: (pageName: string) => `${pageName} | Légal | Beswib`,
		home: 'Transfert Dossards Sécurisé | Running, Trail | Beswib',
		eventWithLocation: (eventName: string, location: string) =>
			`${eventName} à ${location.split(',')[0]} | Dossards de Course`,
		events: 'Événements Running | Dossards Trail, Marathon | Beswib',
		event: (eventName: string) => `${eventName} | Dossards | Beswib`,
	},
	es: {
		site: 'Beswib - Transferencia Legal Dorsales',
		marketplace: 'Comprar & Vender Dorsales | Running, Trail | Beswib',
		legal: (pageName: string) => `${pageName} | Legal | Beswib`,
		home: 'Transferencia Dorsales | Running, Trail, Triatlón | Beswib',
		eventWithLocation: (eventName: string, location: string) =>
			`${eventName} en ${location.split(',')[0]} | Dorsales de Carrera`,
		events: 'Explorar Eventos Running | Encontrar Dorsales Trail, Maratón, Triatlón | Beswib',
		event: (eventName: string) => `${eventName} | Transferencia Dorsales | Comprar & Vender en Beswib`,
	},
	en: {
		site: 'Beswib - Legal Race Bib Transfers',
		marketplace: 'Buy & Sell Race Bibs | Running, Trail, Triathlon | Beswib',
		legal: (pageName: string) => `${pageName} | Legal | Beswib`,
		home: 'Transfer Race Bibs Safely | Running, Trail, Triathlon | Beswib',
		eventWithLocation: (eventName: string, location: string) => `${eventName} in ${location.split(',')[0]} | Race Bibs`,
		events: 'Running Events | Race Bibs for Trail, Marathon | Beswib',
		event: (eventName: string) => `${eventName} | Race Bibs | Beswib`,
	},
	de: {
		site: 'Beswib - Legale Startnummern Transfer',
		marketplace: 'Startnummern Kaufen & Verkaufen | Laufen, Trail | Beswib',
		legal: (pageName: string) => `${pageName} | Rechtlich | Beswib`,
		home: 'Startnummern Transfer | Laufen, Trail, Triathlon | Beswib',
		eventWithLocation: (eventName: string, location: string) =>
			`${eventName} in ${location.split(',')[0]} | Startnummern`,
		events: 'Lauf-Events | Startnummern für Trail, Marathon | Beswib',
		event: (eventName: string) => `${eventName} | Startnummern | Beswib`,
	},
} as const

// Fonction de validation pour s'assurer que toutes les clés sont présentes
export function validateSEOTitles() {
	const requiredKeys = ['site', 'marketplace', 'legal', 'home', 'eventWithLocation', 'events', 'event']
	const locales = Object.keys(SEO_TITLES) as Array<keyof typeof SEO_TITLES>

	for (const locale of locales) {
		const localeTitles = SEO_TITLES[locale]
		for (const key of requiredKeys) {
			if (!(key in localeTitles)) {
				console.error(`Missing key '${key}' for locale '${locale}' in SEO_TITLES`)
			}
		}
	}
}

// Appeler la validation au chargement du module
validateSEOTitles()

// SEO descriptions by language
export const SEO_DESCRIPTIONS = {
	ro: {
		marketplace:
			'Explorează mii de numere de cursă disponibile de la vânzători verificați pe marketplace-ul Beswib. Plăți PayPal sigure și confirmare instantanee pentru evenimente de alergare, trail, triatlon și ciclism. Alătură-te sportivilor din întreaga lume care au încredere în Beswib pentru transferuri sigure.',
		legal:
			'Informații legale complete, termeni de serviciu, politica de confidențialitate și detalii despre protecția datelor pentru marketplace-ul Beswib. Înțelege-ți drepturile și obligațiile când cumperi sau vinzi numere prin platforma noastră sigură.',
		home: 'Transferă numerele de cursă în siguranță cu Beswib, marketplace-ul de încredere pentru sportivi. Cumpără și vinde numere pentru alergare, trail, triatlon și ciclism. Plăți sigure, vânzători verificați și confirmare instantanee. Alătură-te miilor de sportivi care aleg Beswib.',
		events:
			'Descoperă și cumpără numere pentru viitoarele evenimente de alergare, trail, triatlon și ciclism din întreaga lume. Caută după locație, dată și tipul de cursă. Transferuri sigure cu protecție PayPal și aprobare organizator. Găsește-ți următoarea aventură cu Beswib.',
	},
	pt: {
		marketplace:
			'Explore milhares de dorsais de corrida disponíveis de vendedores verificados no marketplace Beswib. Pagamentos PayPal seguros e confirmação instantânea para eventos de running, trail, triatlo e ciclismo. Junte-se a atletas do mundo inteiro que confiam no Beswib para transferências seguras.',
		legal:
			'Informações legais completas, termos de serviço, política de privacidade e detalhes de proteção de dados para o marketplace Beswib. Compreenda seus direitos e obrigações ao comprar ou vender dorsais através da nossa plataforma segura.',
		home: 'Transfira dorsais de corrida com segurança com Beswib, o marketplace confiável para atletas. Compre e venda dorsais para running, trail, triatlo e ciclismo. Pagamentos seguros, vendedores verificados e confirmação instantânea. Junte-se a milhares de atletas que escolhem Beswib.',
		events:
			'Descubra e compre dorsais para próximos eventos de running, trail, triatlo e ciclismo em todo o mundo. Pesquise por localização, data e tipo de corrida. Transferências seguras com proteção PayPal e aprovação do organizador. Encontre sua próxima aventura com Beswib.',
	},
	nl: {
		marketplace:
			'Verken duizenden beschikbare startnummers van geverifieerde verkopers op Beswib marketplace. Veilige PayPal betalingen en directe overdrachtsbevestiging voor hardloop-, trail-, triatlon- en wielrenevenementen. Sluit je aan bij atleten wereldwijd die Beswib vertrouwen voor veilige overdrachten.',
		legal:
			'Complete juridische informatie, servicevoorwaarden, privacybeleid en gegevensbescherming details voor Beswib startnummer marketplace. Begrijp je rechten en verplichtingen bij het kopen of verkopen van startnummers via ons veilige platform.',
		home: 'Draag startnummers veilig over met Beswib, de vertrouwde marketplace voor atleten. Koop en verkoop startnummers voor hardlopen, trail, triatlon en wielrennen. Veilige betalingen, geverifieerde verkopers en directe bevestiging. Sluit je aan bij duizenden atleten die Beswib kiezen.',
		events:
			'Ontdek en koop startnummers voor aankomende hardloop-, trail-, triatlon- en wielrenevenementen wereldwijd. Zoek op locatie, datum en racetype. Veilige overdrachten met PayPal bescherming en organisator goedkeuring. Vind je volgende avontuur met Beswib.',
	},
	ko: {
		marketplace:
			'Beswib 마켓플레이스에서 검증된 판매자의 수천 개 경주 번호를 탐색하세요. 러닝, 트레일, 트라이애슬론, 사이클링 이벤트를 위한 안전한 PayPal 결제와 즉시 이전 확인. 안전한 번호 이전을 위해 Beswib을 신뢰하는 전 세계 운동선수들과 함께하세요.',
		legal:
			'Beswib 경주 번호 마켓플레이스를 위한 완전한 법적 정보, 서비스 약관, 개인정보 보호정책 및 데이터 보호 세부사항. 안전한 플랫폼을 통해 경주 번호를 구매하거나 판매할 때의 권리와 의무를 이해하세요.',
		home: '운동선수를 위한 신뢰할 수 있는 마켓플레이스 Beswib으로 경주 번호를 안전하게 이전하세요. 러닝, 트레일, 트라이애슬론, 사이클링 이벤트용 경주 번호를 구매하고 판매하세요. 안전한 결제, 검증된 판매자, 즉시 확인. Beswib을 선택하는 수천 명의 운동선수와 함께하세요.',
		events:
			'전 세계 다가오는 러닝, 트레일, 트라이애슬론, 사이클링 이벤트의 경주 번호를 발견하고 구매하세요. 위치, 날짜, 경주 유형별로 검색하세요. PayPal 보호와 주최자 승인으로 안전한 이전. Beswib과 함께 다음 모험을 찾아보세요.',
	},
	it: {
		marketplace:
			'Esplora migliaia di pettorali di gara disponibili da venditori verificati su Beswib marketplace. Pagamenti PayPal sicuri e conferma istantanea per eventi di running, trail, triathlon e ciclismo. Unisciti agli atleti di tutto il mondo che si fidano di Beswib per trasferimenti sicuri.',
		legal:
			'Informazioni legali complete, termini di servizio, politica sulla privacy e dettagli protezione dati per Beswib marketplace pettorali. Comprendi i tuoi diritti e obblighi quando acquisti o vendi pettorali attraverso la nostra piattaforma sicura.',
		home: 'Trasferisci pettorali di gara in sicurezza con Beswib, il marketplace di fiducia per atleti. Compra e vendi pettorali per running, trail, triathlon e ciclismo. Pagamenti sicuri, venditori verificati e conferma istantanea. Unisciti a migliaia di atleti che scelgono Beswib.',
		events:
			'Scopri e acquista pettorali per prossimi eventi di running, trail, triathlon e ciclismo in tutto il mondo. Cerca per località, data e tipo di gara. Trasferimenti sicuri con protezione PayPal e approvazione organizzatore. Trova la tua prossima avventura con Beswib.',
	},
	fr: {
		marketplace:
			'Parcourez des milliers de dossards disponibles de vendeurs vérifiés sur la marketplace Beswib. Paiements PayPal sécurisés et confirmation instantanée pour les événements running, trail, triathlon et cyclisme. Rejoignez les athlètes du monde entier qui font confiance à Beswib.',
		legal:
			"Informations légales complètes, conditions de service, politique de confidentialité et protection des données pour la marketplace Beswib. Comprenez vos droits et obligations lors de l'achat ou la vente de dossards via notre plateforme sécurisée.",
		home: "Transférez vos dossards de course en toute sécurité avec Beswib, la marketplace de confiance pour les athlètes. Achetez et vendez des dossards pour running, trail, triathlon et cyclisme. Paiements sécurisés, vendeurs vérifiés et confirmation instantanée. Rejoignez les milliers d'athlètes qui choisissent Beswib.",
		events:
			'Découvrez et achetez des dossards pour les prochains événements running, trail, triathlon et cyclisme dans le monde entier. Recherchez par lieu, date et type de course. Transferts sûrs et sécurisés avec protection PayPal et approbation organisateur. Trouvez votre prochaine aventure avec Beswib.',
	},
	es: {
		marketplace:
			'Explora miles de dorsales de carrera disponibles de vendedores verificados en Beswib marketplace. Pagos PayPal seguros y confirmación instantánea para eventos de running, trail, triatlón y ciclismo. Únete a atletas de todo el mundo que confían en Beswib para transferencias seguras.',
		legal:
			'Información legal completa, términos de servicio, política de privacidad y detalles de protección de datos para Beswib marketplace dorsales. Comprende tus derechos y obligaciones al comprar o vender dorsales a través de nuestra plataforma segura.',
		home: 'Transfiere dorsales de carrera de forma segura con Beswib, el marketplace confiable para atletas. Compra y vende dorsales para running, trail, triatlón y ciclismo. Pagos seguros, vendedores verificados y confirmación instantánea. Únete a miles de atletas que eligen Beswib.',
		events:
			'Descubre y compra dorsales para próximos eventos de running, trail, triatlón y ciclismo en todo el mundo. Busca por ubicación, fecha y tipo de carrera. Transferencias seguras con protección PayPal y aprobación del organizador. Encuentra tu próxima aventura con Beswib.',
	},
	en: {
		marketplace:
			'Browse thousands of available race bibs from verified sellers on Beswib marketplace. Secure PayPal payments and instant transfer confirmation for running, trail, triathlon and cycling events. Join athletes worldwide who trust Beswib for safe bib transfers.',
		legal:
			'Complete legal information, terms of service, privacy policy and data protection details for Beswib race bib marketplace. Understand your rights and obligations when buying or selling race bibs through our secure platform.',
		home: 'Transfer race bibs safely with Beswib, the trusted marketplace for athletes. Buy and sell race bibs for running, trail running, triathlon, and cycling events. Secure payments, verified sellers, and instant confirmation. Join thousands of athletes worldwide who choose Beswib for legal bib transfers.',
		events:
			'Discover and purchase race bibs for upcoming running, trail, triathlon and cycling events worldwide. Browse by location, date, and race type. Safe and secure transfers with PayPal protection and organizer approval. Find your next adventure with Beswib.',
	},
	de: {
		marketplace:
			'Durchsuchen Sie tausende verfügbare Startnummern von verifizierten Verkäufern auf Beswib Marketplace. Sichere PayPal-Zahlungen und sofortige Übertragungsbestätigung für Lauf-, Trail-, Triathlon- und Radsport-Events. Schließen Sie sich Athleten weltweit an, die Beswib für sichere Startnummern-Transfers vertrauen.',
		legal:
			'Vollständige rechtliche Informationen, Nutzungsbedingungen, Datenschutzrichtlinie und Datenschutz-Details für Beswib Startnummern Marketplace. Verstehen Sie Ihre Rechte und Pflichten beim Kauf oder Verkauf von Startnummern über unsere sichere Plattform.',
		home: 'Übertragen Sie Startnummern sicher mit Beswib, dem vertrauenswürdigen Marketplace für Athleten. Kaufen und verkaufen Sie Startnummern für Laufen, Trail, Triathlon und Radsport. Sichere Zahlungen, verifizierte Verkäufer und sofortige Bestätigung. Schließen Sie sich tausenden Athleten an, die Beswib wählen.',
		events:
			'Entdecken und kaufen Sie Startnummern für kommende Lauf-, Trail-, Triathlon- und Radsport-Events weltweit. Suchen Sie nach Ort, Datum und Renntyp. Sichere Übertragungen mit PayPal-Schutz und Veranstalter-Genehmigung. Finden Sie Ihr nächstes Abenteuer mit Beswib.',
	},
} as const

// Fonction de validation pour SEO_DESCRIPTIONS
export function validateSEODescriptions() {
	const requiredKeys = ['marketplace', 'legal', 'home', 'events']
	const locales = Object.keys(SEO_DESCRIPTIONS) as Array<keyof typeof SEO_DESCRIPTIONS>

	for (const locale of locales) {
		const localeDescriptions = SEO_DESCRIPTIONS[locale]
		for (const key of requiredKeys) {
			if (!(key in localeDescriptions)) {
				console.error(`Missing key '${key}' for locale '${locale}' in SEO_DESCRIPTIONS`)
			}
		}
	}
}

// Appeler la validation au chargement du module
validateSEODescriptions()
