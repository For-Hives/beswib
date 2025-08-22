// SEO keywords by language and category
export const SEO_KEYWORDS = {
	ro: {
		raceTypes: {
			triathlon: 'triatlon',
			trail: 'alergare pe trail',
			road: 'alergare pe șosea',
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
		site: 'Beswib',
		marketplace: 'Marketplace | Numere de Cursă de Vânzare',
		legal: (pageName: string) => `${pageName} | Informații Legale`,
		home: 'Transfer Numere de Start | Cumpără și Vinde Numere de Cursă',
		eventWithLocation: (eventName: string, location: string) => `${eventName} în ${location} | Numere`,
		events: 'Răsfoiește Evenimente | Găsește Numere',
		event: (eventName: string) => `${eventName} | Numere de Cursă`,
	},
	pt: {
		site: 'Beswib',
		marketplace: 'Marketplace | Peitos de Corrida à Venda',
		legal: (pageName: string) => `${pageName} | Informações Legais`,
		home: 'Transferência de Peitos | Comprar e Vender Peitos de Corrida',
		eventWithLocation: (eventName: string, location: string) => `${eventName} em ${location} | Peitos`,
		events: 'Explorar Eventos | Encontrar Peitos',
		event: (eventName: string) => `${eventName} | Peitos de Corrida`,
	},
	nl: {
		site: 'Beswib',
		marketplace: 'Marketplace | Startnummers te Koop',
		legal: (pageName: string) => `${pageName} | Juridische Informatie`,
		home: 'Startnummer Overdracht | Koop en Verkoop Startnummers',
		eventWithLocation: (eventName: string, location: string) => `${eventName} in ${location} | Startnummers`,
		events: 'Evenementen Bekijken | Startnummers Vinden',
		event: (eventName: string) => `${eventName} | Startnummers`,
	},
	ko: {
		site: 'Beswib',
		marketplace: '마켓플레이스 | 경주 번호 판매',
		legal: (pageName: string) => `${pageName} | 법적 정보`,
		home: '경주 번호 이전 | 러닝, 트레일, 트라이애슬론 번호 구매 및 판매',
		eventWithLocation: (eventName: string, location: string) => `${eventName} ${location}에서 | 경주 번호`,
		events: '이벤트 탐색 | 경주 번호 찾기',
		event: (eventName: string) => `${eventName} | 경주 번호`,
	},
	it: {
		site: 'Beswib',
		marketplace: 'Marketplace | Pettorali di Gara in Vendita',
		legal: (pageName: string) => `${pageName} | Informazioni Legali`,
		home: 'Trasferimento Petti | Compra e Vendi Pettorali di Gara',
		eventWithLocation: (eventName: string, location: string) => `${eventName} a ${location} | Pettorali`,
		events: 'Sfoglia Eventi | Trova Pettorali',
		event: (eventName: string) => `${eventName} | Pettorali di Gara`,
	},
	fr: {
		site: 'Beswib',
		marketplace: 'Marketplace | Dossards de Course à Vendre',
		legal: (pageName: string) => `${pageName} | Informations Légales`,
		home: 'Transfert de Dossards | Acheter & Vendre des Dossards de Course',
		eventWithLocation: (eventName: string, location: string) => `${eventName} à ${location} | Dossards`,
		events: 'Parcourir les Événements | Trouver des Dossards',
		event: (eventName: string) => `${eventName} | Dossards de Course`,
	},
	es: {
		site: 'Beswib',
		marketplace: 'Marketplace | Dorsales de Carrera en Venta',
		legal: (pageName: string) => `${pageName} | Información Legal`,
		home: 'Transferencia de Dorsales | Comprar y Vender Dorsales de Carrera',
		eventWithLocation: (eventName: string, location: string) => `${eventName} en ${location} | Dorsales`,
		events: 'Explorar Eventos | Encontrar Dorsales',
		event: (eventName: string) => `${eventName} | Dorsales de Carrera`,
	},
	en: {
		site: 'Beswib',
		marketplace: 'Marketplace | Race Bibs for Sale',
		legal: (pageName: string) => `${pageName} | Legal Information`,
		home: 'Transfer Race Bibs | Buy & Sell Running, Trail, Triathlon Bibs',
		eventWithLocation: (eventName: string, location: string) => `${eventName} in ${location} | Race Bibs`,
		events: 'Browse Events | Find Race Bibs',
		event: (eventName: string) => `${eventName} | Race Bibs`,
	},
	de: {
		site: 'Beswib',
		marketplace: 'Marketplace | Startnummern zum Verkauf',
		legal: (pageName: string) => `${pageName} | Rechtliche Informationen`,
		home: 'Startnummern Transfer | Kaufen & Verkaufen von Lauf-Startnummern',
		eventWithLocation: (eventName: string, location: string) => `${eventName} in ${location} | Startnummern`,
		events: 'Events Durchsuchen | Startnummern Finden',
		event: (eventName: string) => `${eventName} | Startnummern`,
	},
} as const

// SEO descriptions by language
export const SEO_DESCRIPTIONS = {
	ro: {
		marketplace:
			'Răsfoiește numerele disponibile de la vânzători verificați. Plată sigură și confirmare instantanee a transferului.',
		legal: 'Informații legale, termeni de serviciu, politica de confidențialitate și protecția datelor pentru Beswib.',
		home: 'Transferă-ți numerele de start în siguranță cu Beswib. Cumpără și vinde numere pentru alergare, trail, triatlon și ciclism.',
		events:
			'Găsește și cumpără numere pentru viitoarele evenimente de alergare, trail, triatlon și ciclism. Transferuri sigure cu Beswib.',
	},
	pt: {
		marketplace:
			'Navegue pelos peitos disponíveis de vendedores verificados. Pagamento seguro e confirmação instantânea de transferência.',
		legal: 'Informações legais, termos de serviço, política de privacidade e proteção de dados para Beswib.',
		home: 'Transfira seus peitos de corrida com segurança com Beswib. Compre e venda peitos para running, trail, triatlo e ciclismo.',
		events:
			'Encontre e compre peitos para próximos eventos de corrida, trail, triatlo e ciclismo. Transferências seguras com Beswib.',
	},
	nl: {
		marketplace:
			'Bekijk beschikbare startnummers van geverifieerde verkopers. Veilige betaling en directe overdrachtsbevestiging.',
		legal: 'Juridische informatie, servicevoorwaarden, privacybeleid en gegevensbescherming voor Beswib.',
		home: 'Draag je startnummers veilig over met Beswib. Koop en verkoop startnummers voor hardlopen, trail, triatlon en wielrennen.',
		events:
			'Vind en koop startnummers voor aankomende hardloop-, trail-, triatlon- en wielerevenementen. Veilige overdrachten met Beswib.',
	},
	ko: {
		marketplace: '검증된 판매자의 사용 가능한 경주 번호를 탐색하세요. 안전한 결제와 즉시 이전 확인.',
		legal: 'Beswib 경주 번호 마켓플레이스의 법적 정보, 서비스 약관, 개인정보 보호정책 및 데이터 보호.',
		home: 'Beswib으로 경주 번호를 안전하게 이전하세요. 러닝, 트레일, 트라이애슬론, 사이클링 경주 번호를 구매하고 판매하세요.',
		events:
			'다가오는 러닝, 트레일, 트라이애슬론, 사이클링 이벤트의 경주 번호를 찾고 구매하세요. Beswib으로 안전한 이전.',
	},
	it: {
		marketplace:
			'Sfoglia pettorali disponibili da venditori verificati. Pagamento sicuro e conferma di trasferimento istantanea.',
		legal: 'Informazioni legali, termini di servizio, politica sulla privacy e protezione dei dati per Beswib.',
		home: 'Trasferisci i tuoi pettorali di gara in sicurezza con Beswib. Compra e vendi pettorali per running, trail, triathlon e ciclismo.',
		events:
			'Trova e acquista pettorali per prossimi eventi di corsa, trail, triathlon e ciclismo. Trasferimenti sicuri con Beswib.',
	},
	fr: {
		marketplace:
			'Parcourez les dossards disponibles de vendeurs vérifiés. Paiement sécurisé et confirmation de transfert instantanée.',
		legal:
			'Informations légales, conditions de service, politique de confidentialité et protection des données pour Beswib.',
		home: 'Transférez vos dossards de course en toute sécurité avec Beswib. Achetez et vendez des dossards de running, trail, triathlon et cyclisme.',
		events:
			'Trouvez et achetez des dossards pour les prochains événements de course, trail, triathlon et cyclisme. Transferts sécurisés avec Beswib.',
	},
	es: {
		marketplace:
			'Explora dorsales disponibles de vendedores verificados. Pago seguro y confirmación de transferencia instantánea.',
		legal: 'Información legal, términos de servicio, política de privacidad y protección de datos para Beswib.',
		home: 'Transfiere tus dorsales de carrera de forma segura con Beswib. Compra y vende dorsales de running, trail, triatlón y ciclismo.',
		events:
			'Encuentra y compra dorsales para próximos eventos de carrera, trail, triatlón y ciclismo. Transferencias seguras con Beswib.',
	},
	en: {
		marketplace:
			'Browse available race bibs from verified sellers. Secure payment and instant transfer confirmation for running, trail and triathlon events.',
		legal: 'Legal information, terms of service, privacy policy and data protection for Beswib race bib marketplace.',
		home: 'Transfer race bibs safely with Beswib. Buy and sell running, trail, triathlon, and cycling race bibs. Join thousands of athletes worldwide.',
		events:
			'Find and purchase race bibs for upcoming running, trail, triathlon and cycling events. Safe and secure transfers with Beswib.',
	},
	de: {
		marketplace:
			'Durchsuchen Sie verfügbare Startnummern von verifizierten Verkäufern. Sichere Zahlung und sofortige Übertragungsbestätigung.',
		legal: 'Rechtliche Informationen, Nutzungsbedingungen, Datenschutzrichtlinie und Datenschutz für Beswib.',
		home: 'Übertragen Sie Ihre Startnummern sicher mit Beswib. Kaufen und verkaufen Sie Startnummern für Laufen, Trail, Triathlon und Radfahren.',
		events:
			'Finden und kaufen Sie Startnummern für kommende Lauf-, Trail-, Triathlon- und Radsport-Events. Sichere Übertragungen mit Beswib.',
	},
} as const
