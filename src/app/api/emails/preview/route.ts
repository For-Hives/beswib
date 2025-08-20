import { render } from '@react-email/components'
import React from 'react'

import { NextRequest, NextResponse } from 'next/server'

import { BeswibEmailVerification, BeswibWelcomeEmail } from '@/components/emails'

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const template = searchParams.get('template')
	const code = searchParams.get('code') || 'ABC-123'
	const firstName = searchParams.get('firstName') || 'Marie'

	try {
		let emailComponent: React.ReactElement

		switch (template) {
			case 'verification':
				emailComponent = React.createElement(BeswibEmailVerification, { validationCode: code })
				break
			case 'welcome':
				emailComponent = React.createElement(BeswibWelcomeEmail, { firstName })
				break
			default:
				return NextResponse.json({ error: 'Template not found. Available: verification, welcome' }, { status: 400 })
		}

		const html = await render(emailComponent)

		return new NextResponse(html, {
			headers: {
				'Content-Type': 'text/html',
			},
		})
	} catch (error) {
		console.error('Email preview error:', error)
		return NextResponse.json({ error: 'Failed to render email template' }, { status: 500 })
	}
}
