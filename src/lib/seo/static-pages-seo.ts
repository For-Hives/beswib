import type { Metadata } from 'next'
import { generateHreflangMetadata } from './hreflang-utils'
import type { Locale } from '@/lib/i18n/config'

// Contenu SEO optimisé pour les pages statiques par langue
const staticPageSEOContent = {
	home: {
		en: {
			title: 'Beswib - Race Bib Transfer Marketplace | Running, Trail, Triathlon, Cycling',
			description: 'Secure marketplace for race bib transfers in running, trail running, triathlon, and cycling. Buy or sell race bibs legally with PayPal protection. Find your next race or resell your bib safely. #1 platform for race registrations.',
			keywords: [
				'race bib transfer',
				'bib resale',
				'running bib',
				'trail running bib',
				'triathlon bib',
				'cycling bib',
				'marathon bib',
				'race registration',
				'bib marketplace',
				'race entry resale',
				'marathon registration',
				'triathlon registration',
				'running marketplace',
				'bib exchange platform',
				'safe bib transfer',
				'race bib platform'
			]
		},
		fr: {
			title: 'Beswib - Marketplace de Transfert de Dossards | Course à Pied, Trail, Triathlon, Cyclisme',
			description: 'Marketplace sécurisé pour le transfert de dossards de course à pied, trail, triathlon et cyclisme. Achetez ou vendez des dossards légalement avec protection PayPal. Trouvez votre prochaine course ou revendez votre dossard en toute sécurité.',
			keywords: [
				'transfert de dossard',
				'revente dossard',
				'dossard course',
				'dossard trail',
				'dossard triathlon',
				'dossard cyclisme',
				'dossard marathon',
				'inscription course',
				'marketplace dossard',
				'revente inscription course',
				'inscription marathon',
				'inscription triathlon',
				'marketplace coureurs',
				'plateforme échange dossards',
				'transfert dossard sécurisé',
				'plateforme dossards'
			]
		},
		de: {
			title: 'Beswib - Startnummern-Transfer Marktplatz | Laufen, Trail, Triathlon, Radfahren',
			description: 'Sicherer Marktplatz für Startnummern-Transfers beim Laufen, Trailrunning, Triathlon und Radfahren. Kaufen oder verkaufen Sie Startnummern legal mit PayPal-Schutz. Finden Sie Ihr nächstes Rennen oder verkaufen Sie Ihre Startnummer sicher.',
			keywords: [
				'Startnummern-Transfer',
				'Startnummern-Verkauf',
				'Lauf-Startnummer',
				'Trailrunning-Startnummer',
				'Triathlon-Startnummer',
				'Rad-Startnummer',
				'Marathon-Startnummer',
				'Rennausschreibung',
				'Startnummern-Marktplatz',
				'Rennausschreibungs-Verkauf',
				'Marathon-Anmeldung',
				'Triathlon-Anmeldung',
				'Läufer-Marktplatz',
				'Startnummern-Austauschplattform',
				'Sicherer Startnummern-Transfer',
				'Startnummern-Plattform'
			]
		},
		es: {
			title: 'Beswib - Marketplace de Transferencia de Dorsales | Carrera, Trail, Triatlón, Ciclismo',
			description: 'Marketplace seguro para transferencias de dorsales de carreras de running, trail, triatlón y ciclismo. Compra o vende dorsales legalmente con protección PayPal. Encuentra tu próxima carrera o revende tu dorsal con seguridad.',
			keywords: [
				'transferencia de dorsal',
				'reventa de dorsal',
				'dorsal carrera',
				'dorsal trail',
				'dorsal triatlón',
				'dorsal ciclismo',
				'dorsal maratón',
				'inscripción carrera',
				'marketplace dorsal',
				'reventa inscripción carrera',
				'inscripción maratón',
				'inscripción triatlón',
				'marketplace corredores',
				'plataforma intercambio dorsales',
				'transferencia dorsal segura',
				'plataforma dorsales'
			]
		},
		it: {
			title: 'Beswib - Marketplace di Trasferimento Pettorali | Corsa, Trail, Triathlon, Ciclismo',
			description: 'Marketplace sicuro per trasferimenti di pettorali di corsa, trail running, triathlon e ciclismo. Compra o vendi pettorali legalmente con protezione PayPal. Trova la tua prossima gara o rivendi il tuo pettorale in sicurezza.',
			keywords: [
				'trasferimento pettorale',
				'rivendita pettorale',
				'pettorale corsa',
				'pettorale trail',
				'pettorale triathlon',
				'pettorale ciclismo',
				'pettorale maratona',
				'iscrizione gara',
				'marketplace pettorale',
				'rivendita iscrizione gara',
				'iscrizione maratona',
				'iscrizione triathlon',
				'marketplace corridori',
				'piattaforma scambio pettorali',
				'trasferimento pettorale sicuro',
				'piattaforma pettorali'
			]
		},
		nl: {
			title: 'Beswib - Startnummer Overdracht Marketplace | Hardlopen, Trail, Triatlon, Fietsen',
			description: 'Veilige marketplace voor startnummer overdrachten bij hardlopen, trailrunning, triatlon en fietsen. Koop of verkoop startnummers legaal met PayPal bescherming. Vind je volgende race of verkoop je startnummer veilig.',
			keywords: [
				'startnummer overdracht',
				'startnummer verkoop',
				'startnummer hardloop',
				'startnummer trail',
				'startnummer triatlon',
				'startnummer fietsen',
				'startnummer marathon',
				'race inschrijving',
				'startnummer marketplace',
				'race inschrijving verkoop',
				'marathon inschrijving',
				'triatlon inschrijving',
				'hardlopers marketplace',
				'startnummer uitwisselplatform',
				'veilige startnummer overdracht',
				'startnummer platform'
			]
		},
		pt: {
			title: 'Beswib - Marketplace de Transferência de Dorsais | Corrida, Trail, Triatlo, Ciclismo',
			description: 'Marketplace seguro para transferências de dorsais de corrida, trail running, triatlo e ciclismo. Compre ou venda dorsais legalmente com proteção PayPal. Encontre sua próxima corrida ou revenda seu dorsal com segurança.',
			keywords: [
				'transferência de dorsal',
				'revenda de dorsal',
				'dorsal corrida',
				'dorsal trail',
				'dorsal triatlo',
				'dorsal ciclismo',
				'dorsal maratona',
				'inscrição corrida',
				'marketplace dorsal',
				'revenda inscrição corrida',
				'inscrição maratona',
				'inscrição triatlo',
				'marketplace corredores',
				'plataforma troca dorsais',
				'transferência dorsal segura',
				'plataforma dorsais'
			]
		},
		da: {
			title: 'Beswib - Startnummer Overførsels Markedsplads | Løb, Trail, Triatlon, Cykling',
			description: 'Sikker markedsplads for startnummer overførsler i løb, trailrunning, triatlon og cykling. Køb eller sælg startnumre lovligt med PayPal beskyttelse. Find dit næste løb eller sælg dit startnummer sikkert.',
			keywords: [
				'startnummer overførsel',
				'startnummer videresalg',
				'startnummer løb',
				'startnummer trail',
				'startnummer triatlon',
				'startnummer cykling',
				'startnummer marathon',
				'race tilmelding',
				'startnummer markedsplads',
				'race tilmelding videresalg',
				'marathon tilmelding',
				'triatlon tilmelding',
				'løber markedsplads',
				'startnummer udvekslingsplatform',
				'sikker startnummer overførsel',
				'startnummer platform'
			]
		},
		sv: {
			title: 'Beswib - Startnummer Överföring Marknadsplats | Löpning, Trail, Triathlon, Cykling',
			description: 'Säker marknadsplats för startnummer överföringar i löpning, trailrunning, triathlon och cykling. Köp eller sälj startnummer lagligt med PayPal-skydd. Hitta ditt nästa lopp eller sälj ditt startnummer säkert.',
			keywords: [
				'startnummer överföring',
				'startnummer återförsäljning',
				'startnummer löpning',
				'startnummer trail',
				'startnummer triathlon',
				'startnummer cykling',
				'startnummer maraton',
				'lopp anmälan',
				'startnummer marknadsplats',
				'lopp anmälan återförsäljning',
				'maraton anmälan',
				'triathlon anmälan',
				'löpar marknadsplats',
				'startnummer utbytesplattform',
				'säker startnummer överföring',
				'startnummer plattform'
			]
		},
		ro: {
			title: 'Beswib - Marketplace Transfer Numere de Competiție | Alergare, Trail, Triatlon, Ciclism',
			description: 'Marketplace sigur pentru transferuri de numere de competiție în alergare, trail running, triatlon și ciclism. Cumpărați sau vindeți numere de competiție legal cu protecție PayPal. Găsiți următoarea cursă sau revindeți numărul de competiție în siguranță.',
			keywords: [
				'transfer număr competiție',
				'revânzare număr competiție',
				'număr competiție alergare',
				'număr competiție trail',
				'număr competiție triatlon',
				'număr competiție ciclism',
				'număr competiție maraton',
				'înscriere cursă',
				'marketplace număr competiție',
				'revânzare înscriere cursă',
				'înscriere maraton',
				'înscriere triatlon',
				'marketplace alergători',
				'platformă schimb număr competiție',
				'transfer sigur număr competiție',
				'platformă numere competiție'
			]
		},
		ko: {
			title: 'Beswib - 대회 참가권 양도 마켓플레이스 | 달리기, 트레일, 트라이애슬론, 사이클링',
			description: '달리기, 트레일 러닝, 트라이애슬론, 사이클링 대회 참가권 양도를 위한 안전한 마켓플레이스. PayPal 보호로 합법적으로 대회 참가권을 사고 팔 수 있습니다. 다음 대회를 찾거나 참가권을 안전하게 재판매하세요.',
			keywords: [
				'대회 참가권 양도',
				'대회 참가권 재판매',
				'달리기 참가권',
				'트레일 참가권',
				'트라이애슬론 참가권',
				'사이클링 참가권',
				'마라톤 참가권',
				'대회 등록',
				'참가권 마켓플레이스',
				'대회 등록 재판매',
				'마라톤 등록',
				'트라이애슬론 등록',
				'러너 마켓플레이스',
				'참가권 교환 플랫폼',
				'안전한 참가권 양도',
				'참가권 플랫폼'
			]
		}
	},
	events: {
		en: {
			title: 'Race Events & Competitions | Find Running, Trail, Triathlon & Cycling Events | Beswib',
			description: 'Discover and participate in race events across running, trail running, triathlon, and cycling. Find your next competition, check available bibs for transfer, and join race communities. Complete event listings with dates, locations, and distances.',
			keywords: [
				'race events',
				'running competitions',
				'trail running events',
				'triathlon events',
				'cycling races',
				'marathon events',
				'running calendar',
				'race schedule',
				'upcoming races',
				'running events near me',
				'trail races',
				'triathlon competitions',
				'cycling events',
				'race calendar 2024',
				'running festival',
				'marathon calendar'
			]
		},
		fr: {
			title: 'Événements et Compétitions de Course | Trouvez des Courses de Running, Trail, Triathlon & Cyclisme | Beswib',
			description: 'Découvrez et participez à des événements de course en course à pied, trail, triathlon et cyclisme. Trouvez votre prochaine compétition, vérifiez les dossards disponibles pour transfert, et rejoignez des communautés de coureurs.',
			keywords: [
				'événements course',
				'compétitions course à pied',
				'événements trail',
				'événements triathlon',
				'courses cyclistes',
				'événements marathon',
				'calendrier course',
				'programme course',
				'prochaines courses',
				'courses près de chez moi',
				'courses trail',
				'compétitions triathlon',
				'événements cyclisme',
				'calendrier course 2024',
				'festival course',
				'calendrier marathon'
			]
		},
		de: {
			title: 'Rennen und Wettkämpfe | Laufen, Trail, Triathlon & Radrennen finden | Beswib',
			description: 'Entdecken und nehmen Sie an Rennen im Laufen, Trailrunning, Triathlon und Radfahren teil. Finden Sie Ihren nächsten Wettkampf, überprüfen Sie verfügbare Startnummern zum Transfer und treten Sie Renn-Communities bei.',
			keywords: [
				'Rennerlebnisse',
				'Laufwettkämpfe',
				'Trailrunning Events',
				'Triathlon Events',
				'Radrennen',
				'Marathon Events',
				'Laufkalender',
				'Renntermine',
				'Kommende Rennen',
				'Laufveranstaltungen in meiner Nähe',
				'Trail Rennen',
				'Triathlon Wettkämpfe',
				'Rad Events',
				'Renntagebuch 2024',
				'Lauffestival',
				'Marathon Kalender'
			]
		},
		es: {
			title: 'Eventos y Competiciones de Carrera | Encuentra Carreras de Running, Trail, Triatlón y Ciclismo | Beswib',
			description: 'Descubre y participa en eventos de carreras de running, trail, triatlón y ciclismo. Encuentra tu próxima competición, revisa dorsales disponibles para transferencia y únete a comunidades de corredores.',
			keywords: [
				'eventos de carrera',
				'competiciones de running',
				'eventos de trail',
				'eventos de triatlón',
				'carreras ciclistas',
				'eventos de maratón',
				'calendario de carreras',
				'programa de carreras',
				'próximas carreras',
				'carreras cerca de mí',
				'carreras de trail',
				'competiciones de triatlón',
				'eventos de ciclismo',
				'calendario de carreras 2024',
				'festival de carreras',
				'calendario de maratón'
			]
		},
		it: {
			title: 'Eventi e Gare di Corsa | Trova Gare di Corsa, Trail, Triathlon e Ciclismo | Beswib',
			description: 'Scopri e partecipa a eventi di corsa in corsa, trail running, triathlon e ciclismo. Trova la tua prossima competizione, controlla i pettorali disponibili per il trasferimento e unisciti alle comunità di corsa.',
			keywords: [
				'eventi di corsa',
				'gare di corsa',
				'eventi trail',
				'eventi triathlon',
				'gare ciclistiche',
				'eventi maratona',
				'calendario corse',
				'programma gare',
				'prossime gare',
				'gare vicino a me',
				'gare trail',
				'gare triathlon',
				'eventi ciclismo',
				'calendario gare 2024',
				'festival della corsa',
				'calendario maratona'
			]
		},
		nl: {
			title: 'Wedstrijden en Competities | Vind Hardloop-, Trail-, Triatlon- en Fietswedstrijden | Beswib',
			description: 'Ontdek en neem deel aan wedstrijden in hardlopen, trailrunning, triatlon en fietsen. Vind je volgende competitie, controleer beschikbare startnummers voor overdracht en sluit je aan bij loopgemeenschappen.',
			keywords: [
				'wedstrijd evenementen',
				'hardloop competities',
				'trail running evenementen',
				'triatlon evenementen',
				'fiets races',
				'marathon evenementen',
				'hardloop kalender',
				'wedstrijd schema',
				'aankomende races',
				'hardloop evenementen bij mij',
				'trail races',
				'triatlon competities',
				'fiets evenementen',
				'wedstrijd kalender 2024',
				'hardloop festival',
				'marathon kalender'
			]
		},
		pt: {
			title: 'Eventos e Competições de Corrida | Encontre Corridas de Running, Trail, Triatlo e Ciclismo | Beswib',
			description: 'Descubra e participe de eventos de corrida em corrida, trail running, triatlo e ciclismo. Encontre sua próxima competição, verifique dorsais disponíveis para transferência e junte-se a comunidades de corrida.',
			keywords: [
				'eventos de corrida',
				'competições de corrida',
				'eventos de trail',
				'eventos de triatlo',
				'corridas ciclistas',
				'eventos de maratona',
				'calendário de corridas',
				'programa de corridas',
				'próximas corridas',
				'corridas perto de mim',
				'corridas de trail',
				'competições de triatlo',
				'eventos de ciclismo',
				'calendário de corridas 2024',
				'festival de corridas',
				'calendário de maratona'
			]
		},
		da: {
			title: 'Løbsarrangementer og Konkurrencer | Find Løb, Trail, Triatlon og Cykelløb | Beswib',
			description: 'Opdag og deltag i løbsarrangementer i løb, trailrunning, triatlon og cykling. Find din næste konkurrence, tjek tilgængelige startnumre til overførsel og slut dig til løbsfællesskaber.',
			keywords: [
				'løbsarrangementer',
				'løbskonkurrencer',
				'trail running arrangementer',
				'triatlon arrangementer',
				'cykelløb',
				'marathon arrangementer',
				'løbskalender',
				'løbsplan',
				'kommende løb',
				'løb nær mig',
				'trail løb',
				'triatlon konkurrencer',
				'cykling arrangementer',
				'løbskalender 2024',
				'løbsfestival',
				'marathon kalender'
			]
		},
		sv: {
			title: 'Loppevenemang och Tävlingar | Hitta Löpning, Trail, Triathlon och Cykeltävlingar | Beswib',
			description: 'Upptäck och delta i loppevenemang i löpning, trailrunning, triathlon och cykling. Hitta din nästa tävling, kontrollera tillgängliga startnummer för överföring och gå med i löpargemenskaper.',
			keywords: [
				'loppevenemang',
				'löpningstävlingar',
				'trail running evenemang',
				'triathlon evenemang',
				'cykeltävlingar',
				'marathon evenemang',
				'löpkalender',
				'tävlings schema',
				'kommande lopp',
				'lopp nära mig',
				'trail lopp',
				'triathlon tävlingar',
				'cykling evenemang',
				'löpkalender 2024',
				'löpningsfestival',
				'marathon kalender'
			]
		},
		ro: {
			title: 'Evenimente și Competiții de Alergare | Găsește Curse de Alergare, Trail, Triatlon și Ciclism | Beswib',
			description: 'Descoperă și participă la evenimente de curse în alergare, trail running, triatlon și ciclism. Găsește-ți următoarea competiție, verifică numerele de competiție disponibile pentru transfer și alătură-te comunităților de alergători.',
			keywords: [
				'evenimente de cursă',
				'competiții de alergare',
				'evenimente trail',
				'evenimente triatlon',
				'curse cicliste',
				'evenimente maraton',
				'calendare curse',
				'program curse',
				'curse viitoare',
				'curse lângă mine',
				'curse trail',
				'competiții triatlon',
				'evenimente ciclism',
				'calendare curse 2024',
				'festival curse',
				'calendare maraton'
			]
		},
		ko: {
			title: '대회 이벤트 및 대회 | 달리기, 트레일, 트라이애슬론, 사이클링 대회 찾기 | Beswib',
			description: '달리기, 트레일 러닝, 트라이애슬론, 사이클링 대회에서 대회 이벤트와 경쟁을 발견하고 참여하세요. 다음 대회를 찾고, 양도 가능한 참가권을 확인하고, 러너 커뮤니티에 가입하세요.',
			keywords: [
				'대회 이벤트',
				'달리기 대회',
				'트레일 러닝 이벤트',
				'트라이애슬론 이벤트',
				'사이클링 대회',
				'마라톤 이벤트',
				'달리기 일정',
				'대회 일정',
				'다가오는 대회',
				'근처 달리기 이벤트',
				'트레일 대회',
				'트라이애슬론 대회',
				'사이클링 이벤트',
				'2024 대회 일정',
				'달리기 축제',
				'마라톤 일정'
			]
		}
	},
	marketplace: {
		en: {
			title: 'Race Bib Marketplace | Buy & Sell Race Registrations Safely | Beswib',
			description: 'Buy and sell race bibs securely with PayPal protection. Find rare race entries for running, trail, triathlon, and cycling events. Safe transfers, verified sellers, instant notifications. Join the #1 bib transfer community.',
			keywords: [
				'bib marketplace',
				'buy race bib',
				'sell race bib',
				'race registration resale',
				'running bib for sale',
				'trail bib transfer',
				'triathlon bib sale',
				'cycling bib marketplace',
				'bib resale platform',
				'race entry transfer',
				'marathon bib sale',
				'safe bib transfer',
				'verified bib sellers',
				'race bib community',
				'bib transfer service',
				'race registration marketplace'
			]
		},
		fr: {
			title: 'Marketplace de Dossards | Achetez et Vendez des Inscriptions de Course en Toute Sécurité | Beswib',
			description: 'Achetez et vendez des dossards de course en toute sécurité avec protection PayPal. Trouvez des inscriptions rares pour des courses de running, trail, triathlon et cyclisme. Transferts sécurisés, vendeurs vérifiés, notifications instantanées.',
			keywords: [
				'marketplace dossard',
				'achat dossard course',
				'vente dossard course',
				'revente inscription course',
				'dossard running en vente',
				'transfert dossard trail',
				'vente dossard triathlon',
				'marketplace dossard cyclisme',
				'plateforme revente dossard',
				'transfert inscription course',
				'vente dossard marathon',
				'transfert dossard sécurisé',
				'vendeurs dossard vérifiés',
				'communauté dossard',
				'service transfert dossard',
				'marketplace inscription course'
			]
		},
		de: {
			title: 'Startnummern-Marktplatz | Startnummern Sicher Kaufen und Verkaufen | Beswib',
			description: 'Kaufen und verkaufen Sie Startnummern sicher mit PayPal-Schutz. Finden Sie seltene Rennteilnahmen für Laufen, Trailrunning, Triathlon und Radfahren. Sichere Transfers, verifizierte Verkäufer, Sofortbenachrichtigungen.',
			keywords: [
				'Startnummern-Marktplatz',
				'Startnummer kaufen',
				'Startnummer verkaufen',
				'Rennausschreibungs-Verkauf',
				'Lauf-Startnummer zum Verkauf',
				'Trail-Startnummern-Transfer',
				'Triathlon-Startnummer-Verkauf',
				'Rad-Startnummern-Marktplatz',
				'Startnummern-Verkaufsplattform',
				'Rennausschreibungs-Transfer',
				'Marathon-Startnummer-Verkauf',
				'Sicherer Startnummern-Transfer',
				'Verifizierte Startnummern-Verkäufer',
				'Startnummern-Community',
				'Startnummern-Transfer-Service',
				'Rennausschreibungs-Marktplatz'
			]
		},
		es: {
			title: 'Marketplace de Dorsales | Compra y Vende Inscripciones de Carrera con Seguridad | Beswib',
			description: 'Compra y vende dorsales de carrera con seguridad y protección PayPal. Encuentra inscripciones raras para carreras de running, trail, triatlón y ciclismo. Transferencias seguras, vendedores verificados, notificaciones instantáneas.',
			keywords: [
				'marketplace dorsal',
				'comprar dorsal carrera',
				'vender dorsal carrera',
				'reventa inscripción carrera',
				'dorsal running en venta',
				'transferencia dorsal trail',
				'venta dorsal triatlón',
				'marketplace dorsal ciclismo',
				'plataforma reventa dorsal',
				'transferencia inscripción carrera',
				'venta dorsal maratón',
				'transferencia dorsal segura',
				'vendedores dorsal verificados',
				'comunidad dorsal',
				'servicio transferencia dorsal',
				'marketplace inscripción carrera'
			]
		},
		it: {
			title: 'Marketplace Pettorali | Compra e Vendi Iscrizioni Gara in Sicurezza | Beswib',
			description: 'Compra e vendi pettorali di gara in sicurezza con protezione PayPal. Trova iscrizioni rare per gare di corsa, trail, triathlon e ciclismo. Trasferimenti sicuri, venditori verificati, notifiche istantanee.',
			keywords: [
				'marketplace pettorale',
				'comprare pettorale gara',
				'vendere pettorale gara',
				'rivendita iscrizione gara',
				'pettorale running in vendita',
				'trasferimento pettorale trail',
				'vendita pettorale triathlon',
				'marketplace pettorale ciclismo',
				'piattaforma rivendita pettorale',
				'trasferimento iscrizione gara',
				'vendita pettorale maratona',
				'trasferimento pettorale sicuro',
				'venditori pettorale verificati',
				'comunità pettorale',
				'servizio trasferimento pettorale',
				'marketplace iscrizione gara'
			]
		},
		nl: {
			title: 'Startnummer Marketplace | Koop en Verkoop Wedstrijdinschrijvingen Veilig | Beswib',
			description: 'Koop en verkoop startnummers veilig met PayPal bescherming. Vind zeldzame race inschrijvingen voor hardlopen, trail, triatlon en fietsen. Veilige transfers, geverifieerde verkopers, directe notificaties.',
			keywords: [
				'startnummer marketplace',
				'startnummer kopen',
				'startnummer verkopen',
				'wedstrijdinschrijving verkoop',
				'hardloop startnummer te koop',
				'trail startnummer overdracht',
				'triatlon startnummer verkoop',
				'fiets startnummer marketplace',
				'startnummer verkoop platform',
				'wedstrijdinschrijving overdracht',
				'marathon startnummer verkoop',
				'veilige startnummer overdracht',
				'geverifieerde startnummer verkopers',
				'startnummer community',
				'startnummer overdracht service',
				'wedstrijdinschrijving marketplace'
			]
		},
		pt: {
			title: 'Marketplace de Dorsais | Compre e Venda Inscrições de Corrida com Segurança | Beswib',
			description: 'Compre e venda dorsais de corrida com segurança e proteção PayPal. Encontre inscrições raras para corridas de running, trail, triatlo e ciclismo. Transferências seguras, vendedores verificados, notificações instantâneas.',
			keywords: [
				'marketplace dorsal',
				'comprar dorsal corrida',
				'vender dorsal corrida',
				'revenda inscrição corrida',
				'dorsal running à venda',
				'transferência dorsal trail',
				'venda dorsal triatlo',
				'marketplace dorsal ciclismo',
				'plataforma revenda dorsal',
				'transferência inscrição corrida',
				'venda dorsal maratona',
				'transferência dorsal segura',
				'vendedores dorsal verificados',
				'comunidade dorsal',
				'serviço transferência dorsal',
				'marketplace inscrição corrida'
			]
		},
		da: {
			title: 'Startnummer Markedsplads | Køb og Sælg Race Tilmeldinger Sikkert | Beswib',
			description: 'Køb og sælg startnumre sikkert med PayPal beskyttelse. Find sjældne race tilmeldinger til løb, trail, triatlon og cykling. Sikre overførsler, verificerede sælgere, øjeblikkelige notifikationer.',
			keywords: [
				'startnummer markedsplads',
				'købe startnummer',
				'sælge startnummer',
				'race tilmelding videresalg',
				'løb startnummer til salg',
				'trail startnummer overførsel',
				'triatlon startnummer salg',
				'cykling startnummer markedsplads',
				'startnummer videresalgsplatform',
				'race tilmelding overførsel',
				'marathon startnummer salg',
				'sikker startnummer overførsel',
				'verificerede startnummer sælgere',
				'startnummer community',
				'startnummer overførsels service',
				'race tilmelding markedsplads'
			]
		},
		sv: {
			title: 'Startnummer Marknadsplats | Köp och Sälj Race Registreringar Säkert | Beswib',
			description: 'Köp och sälj startnummer säkert med PayPal-skydd. Hitta sällsynta race registreringar för löpning, trail, triathlon och cykling. Säkra överföringar, verifierade säljare, omedelbara notifikationer.',
			keywords: [
				'startnummer marknadsplats',
				'köpa startnummer',
				'sälja startnummer',
				'race registrering återförsäljning',
				'löpning startnummer till salu',
				'trail startnummer överföring',
				'triathlon startnummer försäljning',
				'cykling startnummer marknadsplats',
				'startnummer återförsäljningsplattform',
				'race registrering överföring',
				'marathon startnummer försäljning',
				'säker startnummer överföring',
				'verifierade startnummer säljare',
				'startnummer community',
				'startnummer överförings service',
				'race registrering marknadsplats'
			]
		},
		ro: {
			title: 'Marketplace Numere de Competiție | Cumpărați și Vindeți Înscrieri de Cursă în Siguranță | Beswib',
			description: 'Cumpărați și vindeți numere de competiție în siguranță cu protecție PayPal. Găsiți înscrieri rare la curse de alergare, trail, triatlon și ciclism. Transferuri sigure, vânzători verificați, notificări instantanee.',
			keywords: [
				'marketplace număr competiție',
				'cumpara număr competiție',
				'vinde număr competiție',
				'revânzare înscriere cursă',
				'număr competiție alergare de vânzare',
				'transfer număr competiție trail',
				'vânzare număr competiție triatlon',
				'marketplace număr competiție ciclism',
				'platformă revânzare număr competiție',
				'transfer înscriere cursă',
				'vânzare număr competiție maraton',
				'transfer sigur număr competiție',
				'vânzători număr competiție verificați',
				'comunitate număr competiție',
				'serviciu transfer număr competiție',
				'marketplace înscriere cursă'
			]
		},
		ko: {
			title: '대회 참가권 마켓플레이스 | 안전하게 대회 참가권 사고 팔기 | Beswib',
			description: 'PayPal 보호로 대회 참가권을 안전하게 사고 팔 수 있습니다. 달리기, 트레일, 트라이애슬론, 사이클링 대회에서 희귀한 참가권을 찾으세요. 안전한 양도, 검증된 판매자, 즉시 알림.',
			keywords: [
				'참가권 마켓플레이스',
				'대회 참가권 사기',
				'대회 참가권 팔기',
				'대회 등록 재판매',
				'달리기 참가권 판매',
				'트레일 참가권 양도',
				'트라이애슬론 참가권 판매',
				'사이클링 참가권 마켓플레이스',
				'참가권 재판매 플랫폼',
				'대회 등록 양도',
				'마라톤 참가권 판매',
				'안전한 참가권 양도',
				'검증된 참가권 판매자',
				'참가권 커뮤니티',
				'참가권 양도 서비스',
				'대회 등록 마켓플레이스'
			]
		}
	}
}

/**
 * Génère les métadonnées SEO pour une page statique
 */
export function generateStaticPageSEO(page: keyof typeof staticPageSEOContent, locale: Locale): Metadata {
	const content = staticPageSEOContent[page]?.[locale] || staticPageSEOContent[page]?.en

	if (!content) {
		return {
			title: 'Beswib - Race Bib Transfer Platform',
			description: 'Secure marketplace for race bib transfers'
		}
	}

	const baseMetadata: Metadata = {
		title: content.title,
		description: content.description,
		keywords: content.keywords,
		authors: [{ name: 'Beswib Team' }],
		creator: 'Beswib',
		publisher: 'Beswib',
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		metadataBase: new URL('https://beswib.com'),
		openGraph: {
			title: content.title,
			description: content.description,
			url: `https://beswib.com${locale === 'en' ? '' : `/${locale}`}/${page === 'home' ? '' : page}`,
			siteName: 'Beswib',
			images: [
				{
					url: '/beswib.png',
					width: 1200,
					height: 630,
					alt: 'Beswib - Race Bib Transfer Platform',
				},
			],
			locale: locale,
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title: content.title,
			description: content.description,
			images: ['/beswib.png'],
			creator: '@beswib',
			site: '@beswib',
		},
		robots: {
			index: true,
			follow: true,
			nocache: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1,
			},
		},
	}

	// Ajouter les liens hreflang
	const path = page === 'home' ? '' : `/${page}`
	return generateHreflangMetadata(baseMetadata, path, locale)
}