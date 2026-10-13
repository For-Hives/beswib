import type { WebhookEvent } from '@clerk/nextjs/server'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { type NextRequest, NextResponse } from 'next/server'
import type { User } from '@/models/user.model'
import { sendWelcomeEmail } from '@/services/notification.service'
import { createUser } from '@/services/user.services' // Adjust path as necessary
import { linkEmailWaitlistsToUser } from '@/services/waitlist.services'

// Make sure to set CLERK_WEBHOOK_SECRET in your environment variables
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

interface ClerkUserData {
	email_addresses?: Array<{ email_address: string; id: string }>
	first_name?: string
	id: string
	last_name?: string
	primary_email_address_id?: string
}

export async function POST(req: NextRequest) {
	const secretValidation = validateWebhookSecret()
	if (secretValidation) {
		return secretValidation
	}

	const headersValidation = validateSvixHeaders(req)
	if (headersValidation) {
		return headersValidation
	}

	const verificationResult = await verifyWebhookPayload(req)
	if (verificationResult instanceof NextResponse) {
		return verificationResult
	}

	const evt = verificationResult
	const eventType = evt.type

	if (eventType === 'user.created') {
		return await handleUserCreatedEvent(evt)
	}

	return NextResponse.json({ message: `Webhook received: ${eventType}, but no handler configured.` }, { status: 200 })
}

function buildUserData(evt: WebhookEvent, primaryEmail: string): Omit<User, 'created' | 'id' | 'updated'> {
	const userData = evt.data as ClerkUserData
	const { last_name, id: clerkId, first_name } = userData

	return {
		role: 'user' as const,
		postalCode: '',
		phoneNumber: '',
		paypalMerchantId: null,
		paypal_kyc: false,
		medicalCertificateUrl: null,
		locale: 'en', // Default locale for new users

		licenseNumber: null,
		lastName: last_name ?? '',
		gender: null,
		firstName: first_name ?? '',
		emergencyContactRelationship: null,
		emergencyContactPhone: '',
		emergencyContactName: '',

		email: primaryEmail,
		country: null,
		contactEmail: null,
		consentMarket: false,
		clubAffiliation: null,
		clerkId,
		city: null,
		birthDate: null,
		address: null,
	}
}

function extractUserData(evt: WebhookEvent): NextResponse | { clerkId: string; primaryEmail: string } {
	const userData = evt.data as ClerkUserData
	const { id: clerkId, email_addresses } = userData

	if (typeof clerkId !== 'string' || clerkId.trim() === '') {
		console.error('Received user.created event without clerkId')
		return NextResponse.json({ error: 'Missing Clerk User ID in webhook payload' }, { status: 400 })
	}

	const primaryEmail = email_addresses?.find(
		(email: { email_address: string; id: string }) => email.id === userData.primary_email_address_id
	)?.email_address

	if (typeof primaryEmail !== 'string' || primaryEmail.trim() === '') {
		console.error(`User ${clerkId} has no primary email address.`)
		return NextResponse.json({ error: 'Primary email address missing' }, { status: 400 })
	}

	return { primaryEmail, clerkId }
}

async function handleUserCreatedEvent(evt: WebhookEvent): Promise<NextResponse> {
	const extractionResult = extractUserData(evt)
	if (extractionResult instanceof NextResponse) {
		return extractionResult
	}

	const { primaryEmail, clerkId } = extractionResult
	const userData = buildUserData(evt, primaryEmail)

	return await processUserCreation(userData, clerkId)
}

async function processUserCreation(
	userData: Omit<User, 'created' | 'id' | 'updated'>,
	clerkId: string
): Promise<NextResponse> {
	try {
		const newUserInDb = await createUser(userData)

		if (newUserInDb == null) {
			console.error(`Failed to create user ${clerkId} in PocketBase.`)
			return NextResponse.json({ error: 'Failed to create user in database' }, { status: 500 })
		}

		// Link any existing email-only waitlist entries to this new user account
		const linkedCount = await linkEmailWaitlistsToUser(userData.email, newUserInDb)
		if (linkedCount > 0) {
			// biome-ignore lint/suspicious/noConsole: Preserve the existing operational audit log without changing its severity.
			console.info(`Linked ${linkedCount} existing waitlist entries to new user ${newUserInDb.id}`)
		}

		// Fire-and-forget welcome email; don't block webhook success on email failures
		void sendWelcomeEmail({ to: userData.email, firstName: userData.firstName ?? undefined })

		return NextResponse.json(
			{
				welcomeEmailQueued: true,
				message: 'User created and metadata updated successfully',
				linkedWaitlistEntries: linkedCount,
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error(`Error processing user.created event for ${clerkId}:`, error)
		const errorMessage = error instanceof Error ? error.message : 'Internal server error processing user creation.'
		return NextResponse.json({ error: errorMessage }, { status: 500 })
	}
}

function validateSvixHeaders(req: NextRequest): NextResponse | null {
	const svix_id = req.headers.get('svix-id')
	const svix_timestamp = req.headers.get('svix-timestamp')
	const svix_signature = req.headers.get('svix-signature')

	if (svix_id == null || svix_timestamp == null || svix_signature == null) {
		return NextResponse.json({ error: 'Error occured -- no svix headers' }, { status: 400 })
	}

	return null
}

function validateWebhookSecret(): NextResponse | null {
	if (WEBHOOK_SECRET === undefined || WEBHOOK_SECRET == null || WEBHOOK_SECRET.trim() === '') {
		console.error('CLERK_WEBHOOK_SECRET is not set')
		return NextResponse.json({ error: 'Internal Server Error: Webhook secret not configured' }, { status: 500 })
	}
	return null
}

async function verifyWebhookPayload(req: NextRequest): Promise<NextResponse | WebhookEvent> {
	try {
		// Checks the svix signature against the raw request body, then parses it
		return await verifyWebhook(req, { signingSecret: WEBHOOK_SECRET })
	} catch (err) {
		console.error('Error verifying webhook:', err)
		return NextResponse.json({ error: 'Error occured during webhook verification' }, { status: 400 })
	}
}
