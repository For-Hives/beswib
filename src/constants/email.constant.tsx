import type * as React from 'react'

import { getTranslations } from '@/lib/i18n/dictionary'

import constantsLocalesRaw from './locales.json'

type EmailsI18n = {
	emails: {
		layout: { copyright: string }
		welcome: {
			title: string
			preheader: string
			body1: string
			heroSubtitle: string
			cta: string
			nextStepsTitle: string
			nextStep1: string
			nextStep2: string
			nextStep3: string
			help: string
		}
		saleAlert: { title: string; preheader: string; body: string; order: string; bib: string; amount: string }
		contact: { title: string; preheader: string; from: string; email: string; anonymous: string; na: string }
	}
}

type EmailsLocales = Record<string, EmailsI18n>
const constantsLocales = constantsLocalesRaw as unknown as EmailsLocales

function em(locale: string | undefined): EmailsI18n['emails'] {
	const t = getTranslations<EmailsI18n>(locale ?? 'en', constantsLocales)
	const en = getTranslations<EmailsI18n>('en', constantsLocales)
	return t.emails ?? en.emails
}

function tpl(s: string, vars: Record<string, string | number>): string {
	return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), s)
}

// Shared, simple layout for transactional emails
// Keep inline styles for email client compatibility
type EmailLayoutProps = {
	title?: string
	preheader?: string
	children: React.ReactNode
	locale?: string
}

export function EmailLayout({ title, preheader, locale, children }: EmailLayoutProps) {
	// Preheader is visually hidden but appears in inbox preview
	const preheaderText = (preheader ?? '').trim()
	const v = em(locale)
	const year = new Date().getFullYear()
	return (
		<html lang={locale ?? 'en'}>
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
									{tpl(v.layout.copyright, { year })}
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
	locale?: string
}

export function EmailTemplate({ locale, firstName }: EmailTemplateProps) {
	const v = em(locale)
	const title = tpl(v.welcome.title, { firstName })
	const preheader = tpl(v.welcome.preheader, { firstName })
	return (
		<EmailLayout title={title} preheader={preheader} locale={locale}>
			<p style={{ margin: '0 0 12px' }}>{title}</p>
			<p style={{ margin: 0 }}>{v.welcome.body1}</p>
		</EmailLayout>
	)
}

// Useful ready-made templates matching current notifications
export type SaleAlertEmailProps = {
	orderId?: string | null
	bibId?: string | null
	amount?: number | null
	currency?: string | null
	locale?: string
}

export function SaleAlertEmail({ orderId, locale, currency, bibId, amount }: SaleAlertEmailProps) {
	const v = em(locale)
	const lines: Array<[string, string]> = []
	if (typeof orderId === 'string' && orderId.length > 0) lines.push([v.saleAlert.order, orderId])
	if (typeof bibId === 'string' && bibId.length > 0) lines.push([v.saleAlert.bib, bibId])
	if (typeof amount === 'number')
		lines.push([
			v.saleAlert.amount,
			`${amount}${typeof currency === 'string' && currency.length > 0 ? ` ${currency}` : ''}`,
		])

	return (
		<EmailLayout title={v.saleAlert.title} preheader={v.saleAlert.preheader} locale={locale}>
			<p style={{ margin: '0 0 12px' }}>{v.saleAlert.body}</p>
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
	locale?: string
}

export function ContactMessageEmail({ name, message, locale, email }: ContactMessageEmailProps) {
	const v = em(locale)
	return (
		<EmailLayout
			title={v.contact.title}
			preheader={tpl(v.contact.preheader, { name: name || v.contact.anonymous })}
			locale={locale}
		>
			<p style={{ margin: '0 0 8px' }}>
				<strong>{v.contact.from}:</strong> {name || v.contact.anonymous}
			</p>
			<p style={{ margin: '0 0 12px' }}>
				<strong>{v.contact.email}:</strong> {email || v.contact.na}
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

export function renderContactMessageEmailHtml({ name, message, locale, email }: ContactMessageEmailProps): string {
	const safeName = (name ?? '').trim()
	const safeEmail = (email ?? '').trim()
	const safeMessage = message ?? ''
	const v = em(locale)
	const preheader = tpl(v.contact.preheader, { name: safeName || v.contact.anonymous })
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
										<h1 style="margin:0;line-height:28px;font-size:20px">${escapeHtml(v.contact.title)}</h1>
									</td>
								</tr>
								<tr>
									<td style="padding:24px">
										<p style="margin:0 0 8px"><strong>${escapeHtml(v.contact.from)}:</strong> ${escapeHtml(safeName || v.contact.anonymous)}</p>
										<p style="margin:0 0 12px"><strong>${escapeHtml(v.contact.email)}:</strong> ${escapeHtml(safeEmail || v.contact.na)}</p>
										<div style="white-space:pre-wrap;padding:12px;border-radius:6px;border:1px solid #e5e7eb;background-color:#f9fafb;">${nl2br(
											safeMessage
										)}</div>
									</td>
								</tr>
							</tbody>
						</table>
						<p style="text-align:center;margin:12px 0 0;font-size:12px;color:#6b7280">${escapeHtml(
							tpl(v.layout.copyright, { year: new Date().getFullYear() })
						)}</p>
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
	locale?: string
}

export function renderWelcomeEmailHtml({ locale, firstName, baseUrl }: WelcomeEmailProps): string {
	const safeName = (firstName ?? '').trim()
	const siteUrl = (baseUrl ?? 'https://beswib.com').replace(/\/$/, '')
	const logoUrl = `${siteUrl}/beswib.svg`
	const v = em(locale)
	const preheader = escapeHtml(tpl(v.welcome.preheader, { firstName: safeName }))
	return `
<html>
	<body style="padding:0;margin:0;font-family: Arial, Helvetica, sans-serif;color:#E5E7EB;background-color:#0F0F23;">
		<span style="width:0;visibility:hidden;overflow:hidden;opacity:0;max-width:0;max-height:0;height:0;display:none;color:transparent;">${preheader}</span>
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
											<h1 style="margin:0;color:#FFFFFF;font-size:22px;line-height:28px;">${escapeHtml(
												tpl(v.welcome.title, { firstName: safeName })
											)} 👋</h1>
											<p style="margin:8px 0 0;color:#E5E7EB;font-size:14px;">${escapeHtml(v.welcome.heroSubtitle)}</p>
										</div>
									</td>
								</tr>
								<tr>
									<td style="padding:24px">
										<p style="margin:0 0 12px;color:#FFFFFF;font-size:16px;">${escapeHtml(v.welcome.body1)}</p>
										<p style="margin:0 0 16px;color:#E5E7EB;">&nbsp;</p>
										<div style="text-align:center;margin:28px 0;">
											<a href="${siteUrl}/marketplace" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: 600; display: inline-block; box-shadow: 0 4px 8px rgba(59,130,246,0.3);">${escapeHtml(
												v.welcome.cta
											)}</a>
										</div>
										<div style="border:1px solid rgba(156,163,175,0.2);background:#16213E;border-radius:8px;padding:16px;">
											<p style="margin:0 0 8px;color:#E5E7EB;font-weight:600;">${escapeHtml(v.welcome.nextStepsTitle)}</p>
											<ul style="margin:0;padding-left:18px;color:#E5E7EB;">
												<li style="margin:6px 0;">${escapeHtml(v.welcome.nextStep1)}</li>
												<li style="margin:6px 0;">${escapeHtml(v.welcome.nextStep2)}</li>
												<li style="margin:6px 0;">${escapeHtml(v.welcome.nextStep3)}</li>
											</ul>
										</div>
										<p style="margin:16px 0 0;color:#9CA3AF;font-size:12px;text-align:center;">${escapeHtml(
											v.welcome.help
										)} <a href="${siteUrl}" style="color:#60A5FA;text-decoration:none;">beswib.com</a></p>
									</td>
								</tr>
							</tbody>
						</table>
						<p style="text-align:center;margin:12px 0 0;font-size:12px;color:#6b7280">${escapeHtml(
							tpl(v.layout.copyright, { year: new Date().getFullYear() })
						)}</p>
					</td>
				</tr>
			</tbody>
		</table>
	</body>
</html>`
}
