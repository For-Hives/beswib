export const DISCORD_MENTION = '@here'

export function safeDiscordText(value: unknown, max = 5000): string {
  const s = String(value ?? '')
  return s.replaceAll('`', 'ˋ').slice(0, max).trim()
}

export type SaleAlertInfo = {
  orderId?: string | null
  bibId?: string | null
  amount?: number | null
  currency?: string | null
}

export function saleAlertText(info?: SaleAlertInfo): string {
  const parts: string[] = [DISCORD_MENTION + ' New sale completed']
  if (typeof info?.orderId === 'string' && info.orderId.length > 0) parts.push(`order: ${safeDiscordText(info.orderId)}`)
  if (typeof info?.bibId === 'string' && info.bibId.length > 0) parts.push(`bib: ${safeDiscordText(info.bibId)}`)
  if (typeof info?.amount === 'number') {
    const hasCurrency = typeof info?.currency === 'string' && info.currency.length > 0
    parts.push(`amount: ${info.amount}${hasCurrency ? ` ${safeDiscordText(info.currency)}` : ''}`)
  }
  return parts.join(' | ')
}

export function contactSummaryText(name?: string | null, email?: string | null): string {
  const n = safeDiscordText(name ?? '') || 'Anonymous'
  const e = safeDiscordText(email ?? '') || 'n/a'
  return `${DISCORD_MENTION} New contact form message | from: ${n} | email: ${e}`
}

export function contactFullText(message?: string | null): string {
  return ['```', safeDiscordText(message ?? '', 1900), '```'].join('\n')
}
