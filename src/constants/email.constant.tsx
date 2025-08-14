import * as React from 'react'

// Shared, simple layout for transactional emails
// Keep inline styles for email client compatibility
type EmailLayoutProps = {
	title?: string
	preheader?: string
	children: React.ReactNode
}

export function EmailLayout({ title, preheader, children }: EmailLayoutProps) {
	// Preheader is visually hidden but appears in inbox preview
	const preheaderText = (preheader ?? '').trim()
	return (
		<html>
			<body
				style={{
					margin: 0,
					padding: 0,
					backgroundColor: '#f3f4f6',
					color: '#111827',
					fontFamily:
						'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
				}}
			>
				{preheaderText.length > 0 ? (
					<span
						style={{
							display: 'none',
							color: 'transparent',
							height: 0,
							maxHeight: 0,
							maxWidth: 0,
							opacity: 0,
							overflow: 'hidden',
							visibility: 'hidden',
							width: 0,
						}}
					>
						{preheaderText}
					</span>
				) : null}
				<table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
					<tbody>
						<tr>
							<td style={{ padding: '24px 0' }}>
								<table
									width="100%"
									role="presentation"
									style={{
										maxWidth: 600,
										margin: '0 auto',
										backgroundColor: '#ffffff',
										borderRadius: 8,
										overflow: 'hidden',
									}}
								>
									<tbody>
										{title ? (
											<tr>
												<td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
													<h1 style={{ margin: 0, fontSize: 20, lineHeight: '28px' }}>{title}</h1>
												</td>
											</tr>
										) : null}
										<tr>
											<td style={{ padding: 24 }}>{children}</td>
										</tr>
									</tbody>
								</table>
								<p style={{ margin: '12px 0 0', textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
									© {new Date().getFullYear()} Beswib. All rights reserved.
								</p>
							</td>
						</tr>
					</tbody>
				</table>
			</body>
		</html>
	)
}

// Example template from Resend docs
export interface EmailTemplateProps {
	firstName: string
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
	return (
		<EmailLayout title={`Welcome, ${firstName}!`} preheader={`Welcome to Beswib, ${firstName}!`}>
			<p style={{ margin: '0 0 12px' }}>Welcome, {firstName}!</p>
			<p style={{ margin: 0 }}>We’re glad you’re here.</p>
		</EmailLayout>
	)
}

// Useful ready-made templates matching current notifications
export type SaleAlertEmailProps = {
	orderId?: string | null
	bibId?: string | null
	amount?: number | null
	currency?: string | null
}

export function SaleAlertEmail({ orderId, bibId, amount, currency }: SaleAlertEmailProps) {
	const lines: Array<[string, string]> = []
	if (typeof orderId === 'string' && orderId.length > 0) lines.push(['Order', orderId])
	if (typeof bibId === 'string' && bibId.length > 0) lines.push(['Bib', bibId])
	if (typeof amount === 'number') lines.push(['Amount', `${amount}${currency ? ` ${currency}` : ''}`])

	return (
		<EmailLayout title="New sale completed" preheader="A new sale has been completed on Beswib">
			<p style={{ margin: '0 0 12px' }}>A new sale has been completed.</p>
			<table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse' }}>
				<tbody>
					{lines.map(([k, v]) => (
						<tr key={k}>
							<td style={{ padding: '6px 0', color: '#6b7280', width: 120 }}>{k}</td>
							<td style={{ padding: '6px 0' }}>{v}</td>
						</tr>
					))}
				</tbody>
			</table>
		</EmailLayout>
	)
}

export type ContactMessageEmailProps = {
	name: string
	email: string
	message: string
}

export function ContactMessageEmail({ name, email, message }: ContactMessageEmailProps) {
	return (
		<EmailLayout title="New contact message" preheader={`From ${name || 'Anonymous'}`}>
			<p style={{ margin: '0 0 8px' }}>
				<strong>From:</strong> {name || 'Anonymous'}
			</p>
			<p style={{ margin: '0 0 12px' }}>
				<strong>Email:</strong> {email || 'n/a'}
			</p>
			<div
				style={{
					whiteSpace: 'pre-wrap',
					backgroundColor: '#f9fafb',
					border: '1px solid #e5e7eb',
					borderRadius: 6,
					padding: 12,
				}}
			>
				{message}
			</div>
		</EmailLayout>
	)
}

export type SimpleInfoEmailProps = {
	title: string
	body: string
	preheader?: string
}

export function SimpleInfoEmail({ title, body, preheader }: SimpleInfoEmailProps) {
	return (
		<EmailLayout title={title} preheader={preheader}>
			<p style={{ margin: 0 }}>{body}</p>
		</EmailLayout>
	)
}
