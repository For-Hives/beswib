#!/usr/bin/env node

/**
 * Script de test pour envoyer des emails Beswib
 * Usage: node scripts/test-email.mjs YOUR_EMAIL@example.com [verification|welcome] [firstName]
 */

import { render } from '@react-email/components'
import { Resend } from 'resend'
import React from 'react'

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
				{ style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
				React.createElement('h1', { style: { color: '#3B82F6' } }, '🔐 Vérification email - Beswib'),
				React.createElement('p', null, 'Votre code de vérification :'),
				React.createElement(
					'div',
					{
						style: {
							background: '#f3f4f6',
							padding: '20px',
							textAlign: 'center',
							fontSize: '24px',
							fontWeight: 'bold',
							margin: '20px 0',
							borderRadius: '8px',
						},
					},
					validationCode
				),
				React.createElement('p', null, 'Ce code expire dans 15 minutes.'),
				React.createElement(
					'p',
					{ style: { color: '#666', fontSize: '14px' } },
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
				{ style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
				React.createElement('h1', { style: { color: '#3B82F6' } }, `Bienvenue sur Beswib, ${firstName} ! 🏃‍♂️`),
				React.createElement('p', null, 'Félicitations ! Vous rejoignez une communauté de coureurs passionnés.'),
				React.createElement('h2', null, 'Prochaines étapes :'),
				React.createElement(
					'ul',
					null,
					React.createElement('li', null, '📋 Explorez le marketplace'),
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
							href: 'https://beswib.com/marketplace',
							style: {
								background: '#3B82F6',
								color: 'white',
								padding: '12px 24px',
								textDecoration: 'none',
								borderRadius: '8px',
								fontWeight: 'bold',
							},
						},
						'Explorer le marketplace'
					)
				),
				React.createElement(
					'p',
					{ style: { color: '#666', fontSize: '14px' } },
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

		const { data, error } = await resend.emails.send({
			from: fromEmail,
			to: email,
			subject,
			react: emailComponent,
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
