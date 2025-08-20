import { NextRequest, NextResponse } from 'next/server'

import { sendVerificationEmail, sendWelcomeEmail } from '@/services/email.service'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { template, email, ...params } = body

		if (!email || !template) {
			return NextResponse.json({ error: 'Email and template are required' }, { status: 400 })
		}

		let success = false

		switch (template) {
			case 'verification':
				const code = params.code || 'TEST-123'
				success = await sendVerificationEmail(email, code, params.locale)
				break
			case 'welcome':
				success = await sendWelcomeEmail(email, params.firstName, params.locale)
				break
			default:
				return NextResponse.json({ error: 'Template not found. Available: verification, welcome' }, { status: 400 })
		}

		if (success) {
			return NextResponse.json({ message: 'Email sent successfully' })
		} else {
			return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
		}
	} catch (error) {
		console.error('Email test error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
