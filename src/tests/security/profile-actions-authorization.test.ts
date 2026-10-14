// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockPocketbase, mockPocketbaseCollection } from '@/tests/mocks/pocketbase'

// The profile actions are called by the browser. PocketBase is reached with an admin token, so
// nothing but these actions decides whose record is read or written: they run here for real, with the
// real services, over a fake PocketBase. None of them is given the id of a user any more: the account
// is the one of the Clerk session.

vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(),
}))
vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))
vi.mock('@/lib/services/pocketbase', () => ({
	pb: mockPocketbase,
}))
vi.mock('@/services/paypal.services', () => ({
	onboardSeller: vi.fn(),
}))
vi.mock('@/services/notification.service', () => ({
	sendVerificationEmail: vi.fn(),
}))

import { auth } from '@clerk/nextjs/server'
import {
	addVerifiedEmail,
	confirmVerifiedEmail,
	disconnectPayPal,
	fetchMyVerifiedEmails,
	getCurrentUserData,
	removeVerifiedEmail,
	resendVerifiedEmailCode,
	startPayPalOnboarding,
	updateUserProfile,
} from '@/app/[locale]/profile/actions'
import type { PbUserRecordMinimal, User } from '@/models/user.model'
import { sendVerificationEmail } from '@/services/notification.service'
import { onboardSeller } from '@/services/paypal.services'

const CODE = '483920'

function userRecord(id: string, overrides: Partial<PbUserRecordMinimal> = {}): PbUserRecordMinimal {
	return {
		updated: '2031-01-01 00:00:00.000Z',
		role: 'user',
		postalCode: '74000',
		phoneNumber: '+33600000000',
		paypalMerchantId: `MERCHANT${id.toUpperCase()}`,
		paypal_kyc: true,
		medicalCertificateUrl: null,
		locale: 'fr',
		licenseNumber: null,
		lastName: 'Runner',
		id,
		gender: 'other',
		firstName: id,
		emergencyContactRelationship: 'friend',
		emergencyContactPhone: '+33611111111',
		emergencyContactName: 'Sam',
		email: `${id}@example.com`,
		created: '2031-01-01 00:00:00.000Z',
		country: 'FR',
		contactEmail: null,
		consentMarket: false,
		clubAffiliation: null,
		clerkId: `clerk_${id}`,
		city: 'Annecy',
		birthDate: '1990-05-01 00:00:00.000Z',
		address: '1 rue du Lac',
		...overrides,
	}
}

interface VerifiedEmailRecord {
	id: string
	userId: string
	email: string
	verificationCode: string
	isVerified: boolean
	verifiedAt: string | null
	expiresAt: string
	created: string
	updated: string
}

function verifiedEmailRecord(id: string, userId: string, overrides: Partial<VerifiedEmailRecord> = {}) {
	return {
		verifiedAt: null,
		verificationCode: CODE,
		userId,
		// Older than the resend cooldown
		updated: '2031-01-01 00:00:00.000Z',
		isVerified: false,
		id,
		expiresAt: '2999-01-01 00:00:00.000Z',
		email: `${id}@example.org`,
		created: '2031-01-01 00:00:00.000Z',
		...overrides,
	}
}

// What PocketBase holds: two users, and one pending verified e-mail each
let users: Map<string, PbUserRecordMinimal>
let verifiedEmails: Map<string, VerifiedEmailRecord>

/** The collection a call of the fake PocketBase was made on. */
let collections: string[]

function signIn(id: string | null) {
	vi.mocked(auth).mockResolvedValue({ userId: id == null ? null : `clerk_${id}` } as Awaited<ReturnType<typeof auth>>)
}

function notFound() {
	return Object.assign(new Error('The requested resource was not found.'), { status: 404 })
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'error').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})

	users = new Map([
		['alice', userRecord('alice')],
		['mallory', userRecord('mallory')],
	])
	verifiedEmails = new Map([
		['ve_alice', verifiedEmailRecord('ve_alice', 'alice')],
		['ve_mallory', verifiedEmailRecord('ve_mallory', 'mallory')],
	])
	collections = []

	// Which collection a call is for: the services ask for the collection right before they use it
	let current = ''
	mockPocketbase.collection.mockImplementation((name: string) => {
		current = name
		collections.push(name)
		return mockPocketbaseCollection
	})
	const table = () => (current === 'users' ? users : verifiedEmails) as Map<string, { id: string }>

	mockPocketbaseCollection.getFirstListItem.mockImplementation((filter: string) => {
		const clerkId = /^clerkId = "([^"]*)"$/.exec(filter)?.[1]
		const user = [...users.values()].find(candidate => candidate.clerkId === clerkId)
		return user ? Promise.resolve(user) : Promise.reject(notFound())
	})
	mockPocketbaseCollection.getOne.mockImplementation((id: string) => {
		const record = table().get(id)
		return record ? Promise.resolve(record) : Promise.reject(notFound())
	})
	mockPocketbaseCollection.getFullList.mockImplementation(({ filter }: { filter: string }) => {
		const userId = /userId = "([^"]*)"/.exec(filter)?.[1]
		const email = /email = "([^"]*)"/.exec(filter)?.[1]
		// The spam protection asks for the records updated since a cutoff: none of these is that recent
		if (filter.includes('updated >=')) return Promise.resolve([])
		return Promise.resolve(
			[...verifiedEmails.values()].filter(
				record =>
					record.userId === userId &&
					(email == null || record.email === email) &&
					(!filter.includes('isVerified = true') || record.isVerified)
			)
		)
	})
	mockPocketbaseCollection.update.mockImplementation((id: string, data: Record<string, unknown>) => {
		const record = table().get(id)
		if (!record) return Promise.reject(notFound())
		const updated = { ...record, ...data }
		table().set(id, updated)
		return Promise.resolve(updated)
	})
	mockPocketbaseCollection.create.mockImplementation((data: Partial<VerifiedEmailRecord>) => {
		const record = verifiedEmailRecord(`ve_new_${verifiedEmails.size}`, data.userId ?? '', data)
		verifiedEmails.set(record.id, record)
		return Promise.resolve(record)
	})
	mockPocketbaseCollection.delete.mockImplementation((id: string) => {
		if (!table().delete(id)) return Promise.reject(notFound())
		return Promise.resolve(true)
	})

	vi.mocked(sendVerificationEmail).mockResolvedValue(true)
	vi.mocked(onboardSeller).mockResolvedValue({ referral_id: 'REF-1', action_url: 'https://paypal.test/onboard' })
})

afterEach(() => {
	vi.restoreAllMocks()
})

const writes = () =>
	mockPocketbaseCollection.update.mock.calls.length +
	mockPocketbaseCollection.create.mock.calls.length +
	mockPocketbaseCollection.delete.mock.calls.length

describe('profile update (updateUserProfile)', () => {
	it('saves the profile form on the record of the signed-in user', async () => {
		signIn('alice')

		const updated = await updateUserProfile({ lastName: 'Martin', firstName: 'Alice', city: 'Lyon' })

		expect(mockPocketbaseCollection.update).toHaveBeenCalledExactlyOnceWith('alice', {
			lastName: 'Martin',
			firstName: 'Alice',
			city: 'Lyon',
		})
		expect(updated).toMatchObject({ lastName: 'Martin', id: 'alice', firstName: 'Alice', city: 'Lyon' })
		expect(users.get('mallory')).toEqual(userRecord('mallory'))
	})

	it('has no parameter that names another user: an id in the data is not followed', async () => {
		signIn('mallory')

		// The call the browser made before: updateUserProfile(userId, data)
		const legacyCall = updateUserProfile as unknown as (userId: string, data: Partial<User>) => Promise<User>
		await legacyCall('alice', { lastName: 'Hacked' }).catch(() => {})
		await updateUserProfile({ lastName: 'Mallory', id: 'alice' } as Partial<User>)

		expect(users.get('alice')).toEqual(userRecord('alice'))
		for (const [id] of mockPocketbaseCollection.update.mock.calls) expect(id).toBe('mallory')
	})

	it.each([
		['the admin role', { role: 'admin' }],
		['the PayPal merchant id sales are paid to', { paypalMerchantId: 'MERCHANTMALLORY' }],
		['the KYC flag', { paypal_kyc: true }],
		['the Clerk id the session is matched with', { clerkId: 'clerk_alice' }],
		['the account e-mail', { email: 'alice@example.com' }],
		['the locale, which has its own action', { locale: 'de' }],
		['a field the form does not have', { verified: true }],
	])('never writes %s', async (_label, forged) => {
		signIn('mallory')

		await updateUserProfile({ firstName: 'Mallory', ...forged } as Partial<User>)

		expect(mockPocketbaseCollection.update).toHaveBeenCalledExactlyOnceWith('mallory', { firstName: 'Mallory' })
		expect(users.get('mallory')).toEqual(userRecord('mallory', { firstName: 'Mallory' }))
	})

	it('writes every field of the profile form', async () => {
		signIn('alice')
		const form = {
			postalCode: '69001',
			phoneNumber: '+33622222222',
			medicalCertificateUrl: 'https://example.com/certificate.pdf',
			licenseNumber: 'LIC-1',
			lastName: 'Martin',
			gender: 'female' as const,
			firstName: 'Alice',
			emergencyContactRelationship: 'sister',
			emergencyContactPhone: '+33633333333',
			emergencyContactName: 'Zoé',
			country: 'FR',
			contactEmail: 'alice@example.com',
			consentMarket: true,
			clubAffiliation: 'AC Lyon',
			city: 'Lyon',
			birthDate: '1991-02-03',
			address: '2 rue de la République',
		}

		await updateUserProfile(form)

		const [, payload] = mockPocketbaseCollection.update.mock.calls[0] as [string, Record<string, unknown>]
		expect(Object.keys(payload).sort()).toEqual(Object.keys(form).sort())
	})

	it('refuses a visitor who is not signed in', async () => {
		signIn(null)

		await expect(updateUserProfile({ lastName: 'Nobody' })).rejects.toThrow('Authentication required.')

		expect(writes()).toBe(0)
	})

	it('refuses a session that has no account in the database', async () => {
		vi.mocked(auth).mockResolvedValue({ userId: 'clerk_ghost' } as Awaited<ReturnType<typeof auth>>)

		await expect(updateUserProfile({ lastName: 'Ghost' })).rejects.toThrow('Authentication required.')

		expect(writes()).toBe(0)
	})
})

describe('own record (getCurrentUserData)', () => {
	it('answers with the record of the signed-in user, whatever is passed', async () => {
		signIn('mallory')

		const legacyCall = getCurrentUserData as unknown as (userId: string) => Promise<User | null>

		expect((await getCurrentUserData())?.id).toBe('mallory')
		expect((await legacyCall('alice'))?.email).toBe('mallory@example.com')
	})

	it('answers nothing to a visitor who is not signed in', async () => {
		signIn(null)

		expect(await getCurrentUserData()).toBeNull()
		expect(collections).toEqual([])
	})
})

describe('PayPal account (startPayPalOnboarding, disconnectPayPal)', () => {
	it('starts the onboarding with the id of the signed-in user as tracking id', async () => {
		signIn('mallory')

		const legacyCall = startPayPalOnboarding as unknown as (userId: string) => ReturnType<typeof startPayPalOnboarding>
		const result = await legacyCall('alice')

		// PayPal hands this id back to the webhook, which links the merchant account to that user.
		// The only argument the action reads is the language of the page: 'alice' is not one.
		expect(onboardSeller).toHaveBeenCalledExactlyOnceWith('mallory', undefined)
		expect(result).toEqual({ referralId: 'REF-1', actionUrl: 'https://paypal.test/onboard' })
	})

	it('passes on the language of the page, for the way back from PayPal, and nothing else', async () => {
		signIn('mallory')

		await startPayPalOnboarding('fr')
		await startPayPalOnboarding('fr/../../admin')

		expect(onboardSeller).toHaveBeenNthCalledWith(1, 'mallory', 'fr')
		expect(onboardSeller).toHaveBeenNthCalledWith(2, 'mallory', undefined)
	})

	it('does not start an onboarding for a visitor who is not signed in', async () => {
		signIn(null)

		expect(await startPayPalOnboarding()).toEqual({ error: 'Authentication required.' })
		expect(onboardSeller).not.toHaveBeenCalled()
	})

	it('unlinks the PayPal account of the signed-in user only', async () => {
		signIn('mallory')

		const legacyCall = disconnectPayPal as unknown as (userId: string) => ReturnType<typeof disconnectPayPal>
		expect(await legacyCall('alice')).toEqual({ success: true })

		expect(mockPocketbaseCollection.update).toHaveBeenCalledExactlyOnceWith('mallory', {
			paypalMerchantId: null,
			paypal_kyc: false,
		})
		expect(users.get('alice')?.paypalMerchantId).toBe('MERCHANTALICE')
	})

	it('unlinks nothing for a visitor who is not signed in', async () => {
		signIn(null)

		expect(await disconnectPayPal()).toEqual({ error: 'Authentication required.' })
		expect(writes()).toBe(0)
	})
})

describe('verified e-mails', () => {
	it('lists the verified e-mails of the signed-in user only, without their codes', async () => {
		verifiedEmails.set('ve_alice', verifiedEmailRecord('ve_alice', 'alice', { isVerified: true }))
		verifiedEmails.set('ve_mallory', verifiedEmailRecord('ve_mallory', 'mallory', { isVerified: true }))
		signIn('mallory')

		const legacyCall = fetchMyVerifiedEmails as unknown as (userId: string) => ReturnType<typeof fetchMyVerifiedEmails>
		const result = await legacyCall('alice')

		expect(result.success).toBe(true)
		expect(result.data?.map(email => email.id)).toEqual(['ve_mallory'])
		expect(JSON.stringify(result)).not.toContain(CODE)
	})

	it('adds an e-mail to the signed-in user and keeps the code for the mailbox', async () => {
		signIn('mallory')

		const result = await addVerifiedEmail('  new@example.org ')

		expect(mockPocketbaseCollection.create).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({ userId: 'mallory', isVerified: false, email: 'new@example.org' })
		)
		const [to, sentCode] = vi.mocked(sendVerificationEmail).mock.calls[0]
		expect(to).toBe('new@example.org')
		expect(sentCode).toMatch(/^\d{6}$/)
		// The browser that asked gets the record, never the code: reading it would verify any address
		expect(result).toMatchObject({ success: true, data: { verificationCode: '', userId: 'mallory' } })
		expect(JSON.stringify(result)).not.toContain(sentCode)
	})

	it('accepts an address with an apostrophe, as before: it does not end the quoted value of a filter', async () => {
		signIn('mallory')

		expect((await addVerifiedEmail("o'brien@example.org")).success).toBe(true)

		expect(mockPocketbaseCollection.create).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({ userId: 'mallory', email: "o'brien@example.org" })
		)
	})

	it.each([
		['a filter in place of an address', 'x" || userId != "'],
		['a filter without a space in place of an address', 'x"||userId!="@a.b'],
		['an address with a double quote', 'a"b@example.org'],
		['an address with a backslash', String.raw`a\b@example.org`],
		['an address longer than an address can be', `${'a'.repeat(320)}@example.org`],
		['something that is not an address', 'not-an-email'],
		['something that is not a string', { email: 'new@example.org' }],
	])('refuses %s', async (_label, email) => {
		signIn('mallory')

		expect(await addVerifiedEmail(email as string)).toEqual({ success: false, error: 'CREATE_EMAIL_FAILED' })

		expect(collections.filter(name => name === 'verifiedEmails')).toEqual([])
		expect(sendVerificationEmail).not.toHaveBeenCalled()
	})

	it('verifies an e-mail of the signed-in user with its code', async () => {
		signIn('mallory')

		const result = await confirmVerifiedEmail('ve_mallory', CODE)

		expect(result).toMatchObject({ success: true, data: { verificationCode: '', isVerified: true, id: 've_mallory' } })
		expect(verifiedEmails.get('ve_mallory')?.isVerified).toBe(true)
	})

	it('keeps the answers of the service: a wrong code is told as such', async () => {
		signIn('mallory')

		expect(await confirmVerifiedEmail('ve_mallory', '000000')).toEqual({
			success: false,
			error: 'INVALID_VERIFICATION_CODE',
		})
	})

	it('does not verify the e-mail of someone else, even with the right code', async () => {
		signIn('mallory')

		expect(await confirmVerifiedEmail('ve_alice', CODE)).toEqual({ success: false, error: 'VERIFY_EMAIL_FAILED' })

		expect(verifiedEmails.get('ve_alice')?.isVerified).toBe(false)
		expect(writes()).toBe(0)
	})

	it('does not send a new code for the e-mail of someone else', async () => {
		signIn('mallory')

		expect(await resendVerifiedEmailCode('ve_alice')).toEqual({ success: false, error: 'RESEND_CODE_FAILED' })

		expect(sendVerificationEmail).not.toHaveBeenCalled()
		expect(verifiedEmails.get('ve_alice')?.verificationCode).toBe(CODE)
	})

	it('sends a new code for an e-mail of the signed-in user', async () => {
		signIn('mallory')

		expect(await resendVerifiedEmailCode('ve_mallory')).toEqual({ success: true, data: true })

		expect(sendVerificationEmail).toHaveBeenCalledTimes(1)
		expect(vi.mocked(sendVerificationEmail).mock.calls[0][0]).toBe('ve_mallory@example.org')
	})

	it('does not remove the e-mail of someone else', async () => {
		signIn('mallory')

		expect(await removeVerifiedEmail('ve_alice')).toEqual({ success: false, error: 'DELETE_EMAIL_FAILED' })

		expect(mockPocketbaseCollection.delete).not.toHaveBeenCalled()
		expect(verifiedEmails.has('ve_alice')).toBe(true)
	})

	it('removes an e-mail of the signed-in user', async () => {
		signIn('mallory')

		expect(await removeVerifiedEmail('ve_mallory')).toEqual({ success: true, data: true })

		expect(verifiedEmails.has('ve_mallory')).toBe(false)
		expect(verifiedEmails.has('ve_alice')).toBe(true)
	})

	it('answers a missing record like the record of someone else', async () => {
		signIn('mallory')

		expect(await confirmVerifiedEmail('ve_unknown', CODE)).toEqual(await confirmVerifiedEmail('ve_alice', CODE))
		expect(await removeVerifiedEmail('ve_unknown')).toEqual(await removeVerifiedEmail('ve_alice'))
	})

	it.each([
		['list', () => fetchMyVerifiedEmails(), 'FETCH_EMAILS_FAILED'],
		['add', () => addVerifiedEmail('new@example.org'), 'CREATE_EMAIL_FAILED'],
		['verify', () => confirmVerifiedEmail('ve_alice', CODE), 'VERIFY_EMAIL_FAILED'],
		['resend', () => resendVerifiedEmailCode('ve_alice'), 'RESEND_CODE_FAILED'],
		['remove', () => removeVerifiedEmail('ve_alice'), 'DELETE_EMAIL_FAILED'],
	])('refuses to %s for a visitor who is not signed in', async (_label, call, error) => {
		signIn(null)

		expect(await call()).toEqual({ success: false, error })

		expect(collections).toEqual([])
		expect(sendVerificationEmail).not.toHaveBeenCalled()
	})
})
