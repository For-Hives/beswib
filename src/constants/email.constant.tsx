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
					padding: 0,
					margin: 0,
					fontFamily: 'Arial, Helvetica, sans-serif',
					color: '#111827',
					backgroundColor: '#f3f4f6',
				}}
			>
				{preheaderText.length > 0 ? (
					<span
						style={{
							width: 0,
							visibility: 'hidden',
							overflow: 'hidden',
							opacity: 0,
							maxWidth: 0,
							maxHeight: 0,
							height: 0,
							display: 'none',
							color: 'transparent',
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
										overflow: 'hidden',
										maxWidth: 600,
										margin: '0 auto',
										borderRadius: 8,
										backgroundColor: '#ffffff',
									}}
								>
									<tbody>
										{typeof title === 'string' && title.length > 0 ? (
											<tr>
												<td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
													<h1 style={{ margin: 0, lineHeight: '28px', fontSize: 20 }}>{title}</h1>
												</td>
											</tr>
										) : null}
										<tr>
											<td style={{ padding: 24 }}>{children}</td>
										</tr>
									</tbody>
								</table>
								<p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: 12, color: '#6b7280' }}>
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

export function SaleAlertEmail({ orderId, currency, bibId, amount }: SaleAlertEmailProps) {
	const lines: Array<[string, string]> = []
	if (typeof orderId === 'string' && orderId.length > 0) lines.push(['Order', orderId])
	if (typeof bibId === 'string' && bibId.length > 0) lines.push(['Bib', bibId])
	if (typeof amount === 'number')
		lines.push(['Amount', `${amount}${typeof currency === 'string' && currency.length > 0 ? ` ${currency}` : ''}`])

	return (
		<EmailLayout title="New sale completed" preheader="A new sale has been completed on Beswib">
			<p style={{ margin: '0 0 12px' }}>A new sale has been completed.</p>
			<table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse' }}>
				<tbody>
					{lines.map(([k, v]) => (
						<tr key={k}>
							<td style={{ width: 120, padding: '6px 0', color: '#6b7280' }}>{k}</td>
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

export function ContactMessageEmail({ name, message, email }: ContactMessageEmailProps) {
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
					padding: 12,
					borderRadius: 6,
					border: '1px solid #e5e7eb',
					backgroundColor: '#f9fafb',
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

export function SimpleInfoEmail({ title, preheader, body }: SimpleInfoEmailProps) {
	return (
		<EmailLayout title={title} preheader={preheader}>
			<p style={{ margin: 0 }}>{body}</p>
		</EmailLayout>
	)
}

// --- String-based HTML renderers for Server Actions (no react-dom/server) ---

function escapeHtml(s: string): string {
	return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function nl2br(s: string): string {
	return escapeHtml(s).replaceAll('\n', '<br/>')
}

export function renderContactMessageEmailHtml({ name, message, email }: ContactMessageEmailProps): string {
	const safeName = (name ?? '').trim()
	const safeEmail = (email ?? '').trim()
	const safeMessage = message ?? ''
	const preheader = `From ${safeName || 'Anonymous'}`
	return `
<html>
	<body style="padding:0;margin:0;font-family: Arial, Helvetica, sans-serif;color:#111827;background-color:#f3f4f6;">
		<span style="width:0;visibility:hidden;overflow:hidden;opacity:0;max-width:0;max-height:0;height:0;display:none;color:transparent;">${escapeHtml(
			preheader
		)}</span>
		<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
			<tbody>
				<tr>
					<td style="padding:24px 0">
						<table width="100%" role="presentation" style="overflow:hidden;max-width:600px;margin:0 auto;border-radius:8px;background-color:#ffffff;">
							<tbody>
								<tr>
									<td style="padding:16px 24px;border-bottom:1px solid #e5e7eb">
										<h1 style="margin:0;line-height:28px;font-size:20px">New contact message</h1>
									</td>
								</tr>
								<tr>
									<td style="padding:24px">
										<p style="margin:0 0 8px"><strong>From:</strong> ${escapeHtml(safeName || 'Anonymous')}</p>
										<p style="margin:0 0 12px"><strong>Email:</strong> ${escapeHtml(safeEmail || 'n/a')}</p>
										<div style="white-space:pre-wrap;padding:12px;border-radius:6px;border:1px solid #e5e7eb;background-color:#f9fafb;">${nl2br(
											safeMessage
										)}</div>
									</td>
								</tr>
							</tbody>
						</table>
						<p style="text-align:center;margin:12px 0 0;font-size:12px;color:#6b7280">© ${new Date().getFullYear()} Beswib. All rights reserved.</p>
					</td>
				</tr>
			</tbody>
		</table>
	</body>
</html>`
}

// --- Welcome email (string-based) -------------------------------------------------

export type WelcomeEmailProps = {
	firstName?: string
	baseUrl?: string
}

export function renderWelcomeEmailHtml({ firstName, baseUrl }: WelcomeEmailProps): string {
	const safeName = (firstName ?? '').trim()
	const namePart = safeName.length > 0 ? `, ${escapeHtml(safeName)}` : ''
	const siteUrl = (baseUrl ?? 'https://beswib.com').replace(/\/$/, '')
	const logoUrl = `${siteUrl}/beswib.svg`
	const preheader = `Welcome${namePart} to Beswib!`
	return `
<html>
	<body style="padding:0;margin:0;font-family: Arial, Helvetica, sans-serif;color:#E5E7EB;background-color:#0F0F23;">
		<span style="width:0;visibility:hidden;overflow:hidden;opacity:0;max-width:0;max-height:0;height:0;display:none;color:transparent;">${escapeHtml(
			preheader
		)}</span>
		<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
			<tbody>
				<tr>
					<td style="padding:24px 0">
						<table width="100%" role="presentation" style="overflow:hidden;max-width:600px;margin:0 auto;border-radius:12px;background-color:#1A1A2E;box-shadow:0 10px 25px rgba(0,0,0,0.3);">
							<tbody>
								<tr>
									<td style="padding:0;background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%);">
										<div style="padding:24px; text-align:center;">
											<img src="${logoUrl}" alt="Beswib" height="28" style="display:inline-block;vertical-align:middle;filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));"/>
											<div style="height:12px"></div>
											<h1 style="margin:0;color:#FFFFFF;font-size:22px;line-height:28px;">Welcome${namePart} 👋</h1>
											<p style="margin:8px 0 0;color:#E5E7EB;font-size:14px;">Your marketplace for race bibs</p>
										</div>
									</td>
								</tr>
								<tr>
									<td style="padding:24px">
										<p style="margin:0 0 12px;color:#FFFFFF;font-size:16px;">We're excited to have you at <strong>Beswib</strong>.</p>
										<p style="margin:0 0 16px;color:#E5E7EB;">Buy or sell race bibs with ease. Track your listings, manage your waitlists, and find your next challenge.</p>
										<div style="text-align:center;margin:28px 0;">
											<a href="${siteUrl}/marketplace" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: 600; display: inline-block; box-shadow: 0 4px 8px rgba(59,130,246,0.3);">Explore Marketplace</a>
										</div>
										<div style="border:1px solid rgba(156,163,175,0.2);background:#16213E;border-radius:8px;padding:16px;">
											<p style="margin:0 0 8px;color:#E5E7EB;font-weight:600;">Next steps</p>
											<ul style="margin:0;padding-left:18px;color:#E5E7EB;">
												<li style="margin:6px 0;">Complete your profile for faster checkout</li>
												<li style="margin:6px 0;">Browse events and set up waitlist alerts</li>
												<li style="margin:6px 0;">List a bib in minutes with secure payments</li>
											</ul>
										</div>
										<p style="margin:16px 0 0;color:#9CA3AF;font-size:12px;text-align:center;">Need help? Visit <a href="${siteUrl}" style="color:#60A5FA;text-decoration:none;">beswib.com</a></p>
									</td>
								</tr>
							</tbody>
						</table>
						<p style="text-align:center;margin:12px 0 0;font-size:12px;color:#6b7280">© ${new Date().getFullYear()} Beswib. All rights reserved.</p>
					</td>
				</tr>
			</tbody>
		</table>
	</body>
</html>`
}
