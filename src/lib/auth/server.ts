/**
 * Server-side Neon Auth utilities for SvelteKit
 *
 * This module provides server-side authentication utilities,
 * including session verification and token validation.
 */
import { NEON_AUTH_BASE_URL } from '$env/static/private';

/**
 * Verify a session by making a request to Neon Auth with the session cookie
 *
 * @param token - The session token from the auth cookie
 * @returns The session data if valid, null otherwise
 */
export async function verifySession(token: string | undefined) {
	if (!token) {
		return null;
	}

	try {
		// Call Neon Auth's get-session endpoint with the session cookie
		const response = await fetch(`${NEON_AUTH_BASE_URL}/get-session`, {
			method: 'GET',
			headers: {
				// Send the session token as a cookie (same format browser would send)
				Cookie: `__Secure-neon-auth.session_token=${token}`
			}
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data;
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
	// Neon Auth stores session in a cookie - try both secure and non-secure variants
	// In production (HTTPS), it uses __Secure-neon-auth.session_token
	// In development (HTTP), we use neon-auth.session_token (rewritten by proxy)
	return cookies.get('__Secure-neon-auth.session_token') || cookies.get('neon-auth.session_token');
}
