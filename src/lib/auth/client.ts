/**
 * Neon Auth client for SvelteKit
 *
 * This module provides authentication client setup for both server-side
 * and client-side usage in SvelteKit applications.
 */
import { createAuthClient } from '@neondatabase/auth';
import type { BetterAuthSession, BetterAuthUser } from '@neondatabase/auth/types';
import { browser } from '$app/environment';
import { PUBLIC_NEON_AUTH_URL } from '$env/static/public';

/**
 * Auth client instance for the application
 *
 * On the client side, this connects to the public Neon Auth URL.
 * On the server side, requests go through the local API proxy.
 */
export const authClient = createAuthClient(
	// Use the public URL - on the server we'll use the base URL directly
	browser ? PUBLIC_NEON_AUTH_URL : '/api/auth'
);

/**
 * Re-export types from the auth package for convenience
 */
export type Session = BetterAuthSession;
export type User = BetterAuthUser;

/**
 * Helper to check if a session is valid
 */
export function isAuthenticated(session: unknown): session is Session {
	return session !== null && typeof session === 'object' && 'user' in session;
}
