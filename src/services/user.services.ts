'use server'
import { pb } from '@/lib/pocketbaseClient'
import { User } from '@/models/user.model'
import { DateTime } from 'luxon'

// Map PocketBase record (uses 'bithDate') to our User model ('birthDate')
interface PbUserRecordMinimal {
	id: string
	clerkId: string | null
	paypalMerchantId: string | null
	role: 'admin' | 'user'
	email: string
	contactEmail: string | null
	firstName: string | null
	lastName: string | null
	birthDate: string | Date | null
	phoneNumber: string | null
	emergencyContactName: string | null
	emergencyContactPhone: string | null
	emergencyContactRelationship: string | null
	address: string | null
	postalCode: string | null
	city: string | null
	country: string | null
	gender: 'female' | 'male' | 'other' | null
	medicalCertificateUrl: string | null
	licenseNumber: string | null
	clubAffiliation: string | null
	created: string
	updated: string
}

function mapPbRecordToUser(record: PbUserRecordMinimal): User {
	// Debug: Check what we get from PocketBase
	console.log('mapPbRecordToUser - Raw record:', record)
	console.log('mapPbRecordToUser - record.birthDate:', record?.birthDate, 'type:', typeof record?.birthDate)

	// Normalize PB 'birthDate' (string or Date) to 'YYYY-MM-DD' using Luxon
	let birthDate: string | Date | null = null
	const bithDate = record?.birthDate
	if (bithDate instanceof Date) {
		const dt = DateTime.fromJSDate(bithDate).toUTC()
		birthDate = dt.isValid ? dt.toFormat('yyyy-LL-dd') : null
	} else if (typeof bithDate === 'string' && bithDate.trim() !== '') {
		console.log('mapPbRecordToUser - attempting to parse string:', bithDate)
		const dt = DateTime.fromISO(bithDate, { zone: 'utc' })
		console.log('mapPbRecordToUser - DateTime.fromISO result:', dt, 'isValid:', dt.isValid)
		if (!dt.isValid) {
			// Try alternative parsing methods
			const dt2 = DateTime.fromSQL(bithDate)
			console.log('mapPbRecordToUser - DateTime.fromSQL result:', dt2, 'isValid:', dt2.isValid)
			birthDate = dt2.isValid ? dt2.toFormat('yyyy-LL-dd') : null
		} else {
			birthDate = dt.toFormat('yyyy-LL-dd')
		}
	}

	console.log('mapPbRecordToUser - final birthDate:', birthDate)

	return {
		id: record.id,
		clerkId: record.clerkId,
		paypalMerchantId: record.paypalMerchantId,
		role: record.role,
		email: record.email,
		contactEmail: record.contactEmail,
		firstName: record.firstName,
		lastName: record.lastName,
		birthDate,
		phoneNumber: record.phoneNumber,
		emergencyContactName: record.emergencyContactName,
		emergencyContactPhone: record.emergencyContactPhone,
		emergencyContactRelationship: record.emergencyContactRelationship,
		address: record.address,
		postalCode: record.postalCode,
		city: record.city,
		country: record.country,
		gender: record.gender,
		medicalCertificateUrl: record.medicalCertificateUrl,
		licenseNumber: record.licenseNumber,
		clubAffiliation: record.clubAffiliation,
		created: new Date(record.created),
		updated: new Date(record.updated),
	}
}

// Map our User partial (birthDate) to PB payload (birthDate)
function mapUserToPbPayload(user: Partial<User>): Record<string, unknown> {
	const payload: Record<string, unknown> = { ...user }
	if ('birthDate' in payload) {
		const birthDate = payload.birthDate
		delete payload.birthDate
		if (birthDate == null || birthDate === '') {
			payload.birthDate = ''
		} else if (birthDate instanceof Date) {
			const dt = DateTime.fromJSDate(birthDate).toUTC()
			payload.birthDate = dt.isValid ? dt.toISO() : ''
		} else if (typeof birthDate === 'string') {
			// Supports 'YYYY-MM-DD' or ISO strings; normalize to UTC ISO
			const base = birthDate.length === 10 ? `${birthDate}T00:00:00` : birthDate
			const dt = DateTime.fromISO(base, { zone: 'utc' }).toUTC().startOf('day')
			payload.birthDate = dt.isValid ? dt.toISO() : ''
		}
	}
	return payload
}

export async function createUser(user: Partial<User>): Promise<User> {
	try {
		// Tests expect the raw user object to be passed to PocketBase create
		const created = await pb.collection('users').create<PbUserRecordMinimal>(user as Record<string, unknown>)
		return mapPbRecordToUser(created)
	} catch (error) {
		console.error('Error creating user:', error)
		throw error
	}
}

export async function fetchUserByClerkId(clerkId: string | undefined): Promise<null | User> {
	if (clerkId == null || clerkId === undefined || clerkId === '') {
		console.error('Clerk ID is required to fetch user by clerk ID')
		return null
	}
	try {
		const user = await pb.collection('users').getFirstListItem<PbUserRecordMinimal>(`clerkId = "${clerkId}"`)
		return mapPbRecordToUser(user)
	} catch (error) {
		console.error('Error fetching user by clerk ID:', error)
		return null
	}
}

export async function fetchUserById(id: string): Promise<null | User> {
	if (id === '') {
		console.error('User ID (PocketBase record ID) is required to fetch user data.')
		return null
	}
	try {
		const user = await pb.collection('users').getOne<PbUserRecordMinimal>(id)
		return mapPbRecordToUser(user)
	} catch (error) {
		console.error('Error fetching user by ID:', error)
		return null
	}
}

export async function getUserData(userId: string): Promise<null | User> {
	try {
		const user = await pb.collection('users').getOne<PbUserRecordMinimal>(userId)
		return mapPbRecordToUser(user)
	} catch (error) {
		console.error('Error fetching user data:', error)
		return null
	}
}

export async function isUserAdmin(id: string): Promise<boolean> {
	if (!id) {
		return false
	}
	const user = await fetchUserById(id)
	return user?.role === 'admin'
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
	try {
		const payload = mapUserToPbPayload(user)
		const updated = await pb.collection('users').update<PbUserRecordMinimal>(id, payload)
		return mapPbRecordToUser(updated)
	} catch (error) {
		console.error('Error updating user:', error)
		throw error
	}
}
