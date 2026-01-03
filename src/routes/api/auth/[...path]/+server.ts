/**
 * Auth API catch-all route handler
 *
 * This route proxies all authentication requests to Neon Auth.
 * It handles sign-in, sign-up, sign-out, session management, etc.
 *
 * Route: /api/auth/*
 * Example: /api/auth/sign-in, /api/auth/session, etc.
 */
import { NEON_AUTH_BASE_URL } from '$env/static/private';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * Build the target URL for the Neon Auth server
 */
function buildAuthUrl(path: string, searchParams: URLSearchParams): string {
	const baseUrl = NEON_AUTH_BASE_URL.endsWith('/')
		? NEON_AUTH_BASE_URL.slice(0, -1)
		: NEON_AUTH_BASE_URL;

	const url = new URL(`${baseUrl}/${path}`);
	searchParams.forEach((value, key) => {
		url.searchParams.append(key, value);
	});
	return url.toString();
}

/**
 * Common handler for proxying requests to Neon Auth
 */
async function proxyToNeonAuth(
	request: Request,
	path: string,
	searchParams: URLSearchParams
): Promise<Response> {
	// If no auth URL is configured, return a graceful error
	if (!NEON_AUTH_BASE_URL) {
		return new Response(
			JSON.stringify({
				error: 'Authentication not configured',
				message: 'NEON_AUTH_BASE_URL is not set. Please configure Neon Auth.'
			}),
			{
				status: 503,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}

	const targetUrl = buildAuthUrl(path, searchParams);

	try {
		// Forward the request to Neon Auth
		const response = await fetch(targetUrl, {
			method: request.method,
			headers: {
				// Forward relevant headers
				'Content-Type': request.headers.get('Content-Type') || 'application/json',
				Accept: request.headers.get('Accept') || 'application/json',
				// Forward cookies for session management
				Cookie: request.headers.get('Cookie') || '',
				// Forward authorization header if present
				...(request.headers.get('Authorization')
					? { Authorization: request.headers.get('Authorization')! }
					: {})
			},
			body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
			// @ts-expect-error - duplex is needed for streaming request bodies
			duplex: 'half'
		});

		// Create response with all headers from Neon Auth
		const responseHeaders = new Headers();
		response.headers.forEach((value, key) => {
			// Forward all headers including Set-Cookie for session management
			responseHeaders.append(key, value);
		});

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders
		});
	} catch (error) {
		console.error('[Auth Proxy] Error:', error);
		return new Response(
			JSON.stringify({
				error: 'Authentication service unavailable',
				message: 'Failed to connect to authentication server'
			}),
			{
				status: 502,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
}

/**
 * GET handler - session retrieval, OAuth callbacks, etc.
 */
export const GET: RequestHandler = async ({ params, url, request }) => {
	return proxyToNeonAuth(request, params.path ?? '', url.searchParams);
};

/**
 * POST handler - sign-in, sign-up, sign-out, etc.
 */
export const POST: RequestHandler = async ({ params, url, request }) => {
	return proxyToNeonAuth(request, params.path ?? '', url.searchParams);
};

/**
 * PUT handler - for any update operations
 */
export const PUT: RequestHandler = async ({ params, url, request }) => {
	return proxyToNeonAuth(request, params.path ?? '', url.searchParams);
};

/**
 * DELETE handler - for logout or token revocation
 */
export const DELETE: RequestHandler = async ({ params, url, request }) => {
	return proxyToNeonAuth(request, params.path ?? '', url.searchParams);
};

/**
 * PATCH handler - for partial updates
 */
export const PATCH: RequestHandler = async ({ params, url, request }) => {
	return proxyToNeonAuth(request, params.path ?? '', url.searchParams);
};
