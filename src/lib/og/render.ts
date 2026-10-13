type Rendered = Pick<Response, 'arrayBuffer' | 'headers' | 'status'>

/**
 * An ImageResponse draws lazily, while its body is being sent: a failure at that point is out of
 * reach of the route's try / catch and the visitor gets a dropped connection instead of an image.
 * Drawing it here lets the route catch the failure and answer with its fallback image.
 */
export async function rendered(image: Rendered): Promise<Response> {
	const body = await image.arrayBuffer()
	return new Response(body, { status: image.status, headers: image.headers })
}
