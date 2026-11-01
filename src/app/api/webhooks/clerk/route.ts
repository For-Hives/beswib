import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { type NextRequest, NextResponse } from 'next/server'

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

/**
 * Beswib is archived and its people are fictional: an account created at Clerk must not write a real
 * person in the database, nor receive an e-mail. The endpoint stays so that Clerk stops retrying: a
 * signed event is acknowledged, and nothing else happens.
 */
export async function POST(req: NextRequest) {
	if (WEBHOOK_SECRET == null || WEBHOOK_SECRET.trim() === '') {
		console.error('CLERK_WEBHOOK_SIGNING_SECRET is not set')
		return NextResponse.json({ error: 'Internal Server Error: Webhook secret not configured' }, { status: 500 })
	}

	if (
		req.headers.get('svix-id') == null ||
		req.headers.get('svix-timestamp') == null ||
		req.headers.get('svix-signature') == null
	) {
		return NextResponse.json({ error: 'Error occured -- no svix headers' }, { status: 400 })
	}

	try {
		// Checks the svix signature against the raw request body, then parses it
		const event = await verifyWebhook(req, { signingSecret: WEBHOOK_SECRET })
		return NextResponse.json({ message: `Webhook received: ${event.type}, ignored: Beswib is archived.` })
	} catch (err) {
		console.error('Error verifying webhook:', err)
		return NextResponse.json({ error: 'Error occured during webhook verification' }, { status: 400 })
	}
}
