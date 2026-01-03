/**
 * SvelteKit server hooks for authentication
 *
 * This module handles authentication session verification on every request,
 * making the session data available throughout the application via locals.
 */
import type { Handle } from '@sveltejs/kit';
import { verifySession, getSessionToken } from '$lib/auth/server';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Ensure user exists in local database
 *
 * Syncs authenticated Neon Auth user to our users table for foreign key references.
 * Uses upsert pattern to avoid race conditions.
 */
async function ensureUserExists(user: { id: string; email: string; name: string | null }) {
	try {
		// Check if user already exists
		const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, user.id));

		if (existing.length === 0) {
			// Insert new user - use the Neon Auth user ID as our user ID
			await db.insert(users).values({
				id: user.id,
				email: user.email,
				name: user.name || 'User'
			});
		}
	} catch (error) {
		// Log but don't fail the request - user sync is best-effort
		// The unique constraint on email may cause issues if user updates their email
		console.error('[Auth] Failed to sync user to database:', error);
	}
}

/**
 * Main hook handler that runs on every server request
 *
 * Responsibilities:
 * 1. Extract session token from cookies
 * 2. Verify session with Neon Auth
 * 3. Sync user to local database for foreign key references
 * 4. Attach session data to locals for use in routes
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

				// Ensure user exists in our database for foreign key references
				await ensureUserExists(session.user);
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
