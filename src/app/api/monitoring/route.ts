export const dynamic = 'force-dynamic'

function parseSentryDsn(dsn: string) {
    const url = new URL(dsn)
    const projectId = url.pathname.replace('/', '')
    const host = url.host
    const publicKey = url.username
    return { publicKey, projectId, host }
}

export async function POST(request: Request) {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN
    if (typeof dsn !== 'string' || dsn.length === 0) {
        return new Response('Missing SENTRY_DSN', { status: 204 })
    }

    const { publicKey, projectId, host } = parseSentryDsn(dsn)
    const upstream = `https://${host}/api/${projectId}/envelope/?sentry_key=${publicKey}&sentry_version=7`

    const bodyText = await request.text()
    const contentType = request.headers.get('content-type') ?? 'application/x-sentry-envelope'

    try {
        const res = await fetch(upstream, {
            method: 'POST',
            headers: {
                'content-type': contentType,
            },
            body: bodyText,
        })

        return new Response(null, { status: res.status })
    } catch {
        return new Response(null, { status: 204 })
    }
}
