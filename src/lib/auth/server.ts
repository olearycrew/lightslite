/**
 * Server-side Neon Auth utilities for SvelteKit
 *
 * This module provides server-side authentication utilities,
 * including session verification and token validation.
 */
import { createAuthClient } from '@neondatabase/auth';
import { NEON_AUTH_BASE_URL } from '$env/static/private';

/**
 * Server-side auth client using the base URL
 *
 * This client makes direct requests to Neon Auth servers
 * for session verification and management.
 */
export const serverAuth = createAuthClient(NEON_AUTH_BASE_URL);

/**
 * Verify a session token from cookies
 *
 * @param token - The session token from the auth cookie
 * @returns The session data if valid, null otherwise
 */
export async function verifySession(token: string | undefined) {
	if (!token) {
		return null;
	}

	try {
		const session = await serverAuth.getSession({
			fetchOptions: {
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		});
		return session.data;
	} catch {
		// Session verification failed - token may be expired or invalid
		return null;
	}
}

/**
 * Get the session token from SvelteKit cookies
 *
 * @param cookies - SvelteKit cookies object
 * @returns The session token if present
 */
export function getSessionToken(cookies: {
	get: (name: string) => string | undefined;
}): string | undefined {
	// Neon Auth stores session in a cookie named 'better-auth.session_token'
	return cookies.get('better-auth.session_token');
}
