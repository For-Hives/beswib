// The fictional content of the archived site. Everything here is invented: the people, the races, the
// organizers, the places. E-mails are on example.com, phone numbers in the +33 1 99 00 range that the
// French regulator keeps for fiction. Pure: the only input is the date of the run.

const ORGANIZERS = [
	['Les Foulées de Nullepart', 'foulees-nullepart'],
	['Association Trail Imaginaire', 'trail-imaginaire'],
	['Club Triathlon de Valfictive', 'tri-valfictive'],
	['Roue Libre Organisation', 'roue-libre'],
]

// name, type, place, km, elevation, participants, official price, organizer
const EVENTS = [
	['Trail des Crêtes Imaginaires', 'trail', 'Valfictive, France', 42, 2400, 1500, 75, 1],
	['Semi-marathon de Nullepart', 'road', 'Nullepart-sur-Mer, France', 21, 120, 4000, 38, 0],
	['10 km de Fictiville', 'road', 'Fictiville, France', 10, 40, 2500, 22, 0],
	['Ultra du Mont Exemple', 'trail', 'Mont-Exemple, France', 80, 5200, 800, 120, 1],
	['Triathlon du Lac Sans Nom', 'triathlon', 'Lac-Sans-Nom, France', 51, 450, 900, 110, 2],
	['Marathon de la Vallée Perdue', 'road', 'Vallée-Perdue, France', 42, 300, 6000, 65, 0],
	['Cyclo des Trois Cols Rêvés', 'cycle', 'Col-Rêvé, France', 120, 2800, 1200, 55, 3],
	['Trail de la Forêt Inventée', 'trail', 'Bois-Inventé, France', 25, 900, 1100, 35, 1],
	['Duathlon de Portfictif', 'other', 'Portfictif, France', 30, 150, 400, 45, 2],
	['Corrida de Villefausse', 'road', 'Villefausse, France', 8, 30, 1800, 18, 0],
	['Granfondo de Cimedemo', 'cycle', 'Cimedemo, France', 95, 1900, 1000, 50, 3],
	['Triathlon de la Baie Fantôme', 'triathlon', 'Baie-Fantôme, France', 26, 90, 700, 80, 2],
]

const RUNNERS = [
	['Camille', 'Fictive', 'female'],
	['Lucas', 'Exemple', 'male'],
	['Inès', 'Inventée', 'female'],
	['Noé', 'Demo', 'male'],
	['Léa', 'Imaginaire', 'female'],
	['Hugo', 'Fictif', 'male'],
	['Sacha', 'Exemple', 'other'],
	['Manon', 'Demo', 'female'],
	['Théo', 'Inventé', 'male'],
	['Jade', 'Fictive', 'female'],
	['Mathis', 'Imaginaire', 'male'],
	['Lina', 'Exemple', 'female'],
	['Enzo', 'Demo', 'male'],
	['Zoé', 'Fictive', 'female'],
	['Nolan', 'Inventé', 'male'],
	['Alix', 'Exemple', 'other'],
]

const BIBS_PER_EVENT = 3
const PLATFORM_FEE_RATE = 0.05

function pad(value, width = 3) {
	return String(value).padStart(width, '0')
}

// PocketBase ids are 15 lower-case alphanumerics, and these show they are not real ones
function id(prefix, index) {
	return `${prefix}${pad(index, 15 - prefix.length)}`
}

function ascii(text) {
	return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function monthsAfter(now, months, day = 12) {
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + months, day, 8, 0, 0))
}

function pbDate(date) {
	return date.toISOString().replace('T', ' ')
}

/** Every record to create, by collection, in an order that respects the relations. */
export function buildFictionalData(now) {
	const organizer = ORGANIZERS.map(([name, slug], index) => ({
		id: id('demoorg', index + 1),
		name,
		email: `${slug}@example.com`,
		website: `https://example.com/${slug}`,
		isPartnered: true,
	}))

	// Spread over the next three years: the listings stay on sale long after the run, and running
	// this script again moves them forward
	const events = EVENTS.map(
		([name, typeCourse, location, distanceKm, elevationGainM, participants, price, org], index) => {
			const eventDate = monthsAfter(now, 12 + index * 2)
			return {
				id: id('demoevent', index + 1),
				name,
				typeCourse,
				location,
				distanceKm,
				elevationGainM,
				participants,
				officialStandardPrice: price,
				description: `${name} : une course inventée pour la démonstration d'un projet archivé. Elle n'existe pas.`,
				eventDate: pbDate(eventDate),
				transferDeadline: pbDate(monthsAfter(now, 12 + index * 2 - 1)),
				bibPickupWindowBeginDate: pbDate(new Date(eventDate.getTime() - 2 * 24 * 3600 * 1000)),
				bibPickupWindowEndDate: pbDate(new Date(eventDate.getTime() - 24 * 3600 * 1000)),
				bibPickupLocation: `Village de course, ${location}`,
				registrationUrl: `https://example.com/inscription/${index + 1}`,
				parcoursUrl: `https://example.com/parcours/${index + 1}`,
				options: [{ key: 'size', label: 'Size', required: false, values: ['S', 'M', 'L'] }],
				organizer: organizer[org].id,
			}
		}
	)

	const users = RUNNERS.map(([firstName, lastName, gender], index) => {
		const number = pad(index + 1, 2)
		return {
			id: id('demouser', index + 1),
			clerkId: `fictional_${number}`,
			role: 'user',
			email: `${ascii(firstName)}.${ascii(lastName)}.${number}@example.com`,
			contactEmail: null,
			consentMarket: false,
			firstName,
			lastName,
			gender,
			locale: 'fr',
			birthDate: pbDate(new Date(Date.UTC(1975 + index, index % 12, 10 + index))),
			phoneNumber: `+331990000${number}`,
			emergencyContactName: 'Contact Fictif',
			emergencyContactPhone: `+331990001${number}`,
			emergencyContactRelationship: 'Fictif',
			address: `${index + 1} rue de l'Exemple`,
			postalCode: '00000',
			city: 'Fictiville',
			country: 'FR',
			paypalMerchantId: '',
			paypal_kyc: false,
			medicalCertificateUrl: null,
			licenseNumber: null,
			clubAffiliation: 'Club Imaginaire',
		}
	})

	// Half the runners sell, the other half buy
	const sellers = users.slice(0, 8)
	const buyers = users.slice(8)

	const verifiedEmails = sellers.map((seller, index) => ({
		id: id('demoemail', index + 1),
		userId: seller.id,
		email: seller.email,
		verificationCode: '000000',
		isVerified: true,
		verifiedAt: pbDate(now),
		expiresAt: pbDate(now),
	}))

	const bibs = []
	const transactions = []
	events.forEach((event, eventIndex) => {
		for (let slot = 0; slot < BIBS_PER_EVENT; slot++) {
			const number = bibs.length + 1
			const sellerIndex = number % sellers.length
			const official = event.officialStandardPrice
			const price = Math.round(official * (0.7 + slot * 0.1))
			// The last bib of every third event is sold, so that the dashboards have something to show
			const sold = slot === BIBS_PER_EVENT - 1 && eventIndex % 3 === 0
			const bib = {
				id: id('demobib', number),
				eventId: event.id,
				sellerUserId: sellers[sellerIndex].id,
				linkedEmailId: verifiedEmails[sellerIndex].id,
				price,
				originalPrice: official,
				registrationNumber: `DEMO-${pad(number, 4)}`,
				status: sold ? 'sold' : 'available',
				listed: 'public',
				validated: true,
				optionValues: { size: ['S', 'M', 'L'][slot] },
				lockedAt: null,
			}
			if (sold) {
				const buyer = buyers[transactions.length % buyers.length]
				bib.buyerUserId = buyer.id
				transactions.push({
					id: id('demotx', transactions.length + 1),
					bib_id: bib.id,
					amount: price,
					// Never 0, which PocketBase refuses on a required number, and whole in case decimals are refused
					platform_fee: Math.max(1, Math.round(price * PLATFORM_FEE_RATE)),
					status: 'succeeded',
					transactionDate: pbDate(now),
					buyer_user_id: buyer.id,
					seller_user_id: bib.sellerUserId,
					paypal_order_id: `DEMO-ORDER-${pad(transactions.length + 1, 4)}`,
					paypal_capture_id: `DEMO-CAPTURE-${pad(transactions.length + 1, 4)}`,
					payer_email: buyer.email,
					payer_id: `DEMO-PAYER-${pad(transactions.length + 1, 4)}`,
					currency: 'EUR',
					payment_status: 'COMPLETED',
					capture_time: pbDate(now),
					raw_webhook_payload: { fictional: true },
				})
			}
			bibs.push(bib)
		}
	})

	const waitlists = events.slice(0, 6).map((event, index) => ({
		id: id('demowait', index + 1),
		event_id: event.id,
		user_id: buyers[index % buyers.length].id,
		email: buyers[index % buyers.length].email,
		mail_notification: false,
		optionPreferences: { size: 'M' },
		added_at: pbDate(now),
	}))

	return { organizer, events, users, verifiedEmails, bibs, transactions, waitlists }
}
