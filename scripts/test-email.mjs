#!/usr/bin/env node

/**
 * Script de test pour envoyer des emails Beswib
 * Usage: node scripts/test-email.mjs YOUR_EMAIL@example.com [verification|welcome] [firstName]
 */

import { render } from '@react-email/components'
import React from 'react'

import { Resend } from 'resend'

// Simple implementation for testing
const BeswibEmailVerification = ({ validationCode = 'TEST-123' }) => {
	return React.createElement(
		'html',
		null,
		React.createElement(
			'body',
			{ style: { fontFamily: 'Arial, sans-serif' } },
			React.createElement(
				'div',
				{ style: { padding: '20px', maxWidth: '600px', margin: '0 auto' } },
				React.createElement('h1', { style: { color: '#3B82F6' } }, '🔐 Vérification email - Beswib'),
				React.createElement('p', null, 'Votre code de vérification :'),
				React.createElement(
					'div',
					{
						style: {
							textAlign: 'center',
							padding: '20px',
							margin: '20px 0',
							fontWeight: 'bold',
							fontSize: '24px',
							borderRadius: '8px',
							background: '#f3f4f6',
						},
					},
					validationCode
				),
				React.createElement('p', null, 'Ce code expire dans 15 minutes.'),
				React.createElement(
					'p',
					{ style: { fontSize: '14px', color: '#666' } },
					"Si vous n'avez pas demandé cette vérification, ignorez cet email."
				)
			)
		)
	)
}

const BeswibWelcomeEmail = ({ firstName = 'Coureur' }) => {
	return React.createElement(
		'html',
		null,
		React.createElement(
			'body',
			{ style: { fontFamily: 'Arial, sans-serif' } },
			React.createElement(
				'div',
				{ style: { padding: '20px', maxWidth: '600px', margin: '0 auto' } },
				React.createElement('h1', { style: { color: '#3B82F6' } }, `Bienvenue sur Beswib, ${firstName} ! 🏃‍♂️`),
				React.createElement('p', null, 'Félicitations ! Vous rejoignez une communauté de coureurs passionnés.'),
				React.createElement('h2', null, 'Prochaines étapes :'),
				React.createElement(
					'ul',
					null,
					React.createElement('li', null, '📋 Explorez la marketplace'),
					React.createElement('li', null, '👤 Complétez votre profil'),
					React.createElement('li', null, '🏃 Trouvez votre prochaine course'),
					React.createElement('li', null, '💝 Vendez vos dossards inutilisés')
				),
				React.createElement(
					'div',
					{
						style: {
							textAlign: 'center',
							margin: '30px 0',
						},
					},
					React.createElement(
						'a',
						{
							style: {
								textDecoration: 'none',
								padding: '12px 24px',
								fontWeight: 'bold',
								color: 'white',
								borderRadius: '8px',
								background: '#3B82F6',
							},
							href: 'https://beswib.com/marketplace',
						},
						'Explorer la marketplace'
					)
				),
				React.createElement(
					'p',
					{ style: { fontSize: '14px', color: '#666' } },
					'Bonnes courses !',
					React.createElement('br'),
					"L'équipe Beswib"
				)
			)
		)
	)
}

async function sendTestEmail() {
	const [, , email, template = 'verification', firstName = 'Test User'] = process.argv

	if (!email) {
		console.error('❌ Usage: node scripts/test-email.mjs YOUR_EMAIL@example.com [verification|welcome] [firstName]')
		process.exit(1)
	}

	// Check environment variables
	const apiKey = process.env.RESEND_API_KEY
	const fromEmail = process.env.NOTIFY_EMAIL_FROM || 'noreply@beswib.com'

	if (!apiKey) {
		console.error("❌ RESEND_API_KEY non configurée dans les variables d'environnement")
		process.exit(1)
	}

	const resend = new Resend(apiKey)

	try {
		let emailComponent
		let subject

		switch (template) {
			case 'verification':
				emailComponent = BeswibEmailVerification({ validationCode: 'TEST-123' })
				subject = '🔐 Confirmez votre adresse email - Beswib'
				break
			case 'welcome':
				emailComponent = BeswibWelcomeEmail({ firstName })
				subject = `Bienvenue sur Beswib, ${firstName} ! 🏃‍♂️`
				break
			default:
				console.error('❌ Template non reconnu. Utilisez "verification" ou "welcome"')
				process.exit(1)
		}

		console.log(`📧 Envoi de l'email ${template} vers ${email}...`)

		const { error, data } = await resend.emails.send({
			to: email,
			subject,
			react: emailComponent,
			from: fromEmail,
		})

		if (error) {
			console.error("❌ Erreur lors de l'envoi:", error)
			process.exit(1)
		}

		console.log('✅ Email envoyé avec succès!')
		console.log('📋 ID:', data?.id)
		console.log('📧 Destinataire:', email)
		console.log('📨 Template:', template)
		console.log('\n💡 Vérifiez votre boîte email (et les spams)')
	} catch (error) {
		console.error('❌ Erreur:', error.message)
		process.exit(1)
	}
}

sendTestEmail()
