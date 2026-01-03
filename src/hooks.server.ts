/**
 * SvelteKit server hooks for authentication
 *
 * This module handles authentication session verification on every request,
 * making the session data available throughout the application via locals.
 */
import type { Handle } from '@sveltejs/kit';
import { verifySession, getSessionToken } from '$lib/auth/server';

/**
 * Main hook handler that runs on every server request
 *
 * Responsibilities:
 * 1. Extract session token from cookies
 * 2. Verify session with Neon Auth
 * 3. Attach session data to locals for use in routes
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Initialize locals with null values
	event.locals.session = null;
	event.locals.user = null;

	// Skip auth verification for auth API routes to avoid circular requests
	if (event.url.pathname.startsWith('/api/auth')) {
		return resolve(event);
	}

	try {
		// Get token from cookies
		const token = getSessionToken(event.cookies);

		// Verify session if token exists
		if (token) {
			const session = await verifySession(token);
			if (session) {
				event.locals.session = session.session;
				event.locals.user = session.user;
			}
		}
	} catch (error) {
		// Log error in development but don't block the request
		if (import.meta.env.DEV) {
			console.error('[Auth] Session verification error:', error);
		}
		// Session verification failed - user continues as unauthenticated
	}

	return resolve(event);
};
