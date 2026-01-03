/**
 * Neon Auth client for SvelteKit
 *
 * This module provides authentication client setup for client-side usage.
 * All auth requests go through the local /api/auth proxy to ensure cookies
 * are set on the correct domain.
 */
import { createAuthClient } from '@neondatabase/auth';
import type { BetterAuthSession, BetterAuthUser } from '@neondatabase/auth/types';
import { browser } from '$app/environment';

/** Type for the auth client */
type AuthClient = ReturnType<typeof createAuthClient>;

/**
 * Lazily-initialized auth client instance.
 * Created on first access to ensure window.location is available.
 */
let _authClient: AuthClient | undefined;

/**
 * Get the auth client instance.
 * Lazily initializes the client using the current window origin.
 *
 * @throws Error if called during SSR (auth should only be used client-side)
 */
function getAuthClient(): AuthClient {
	if (!_authClient) {
		if (!browser) {
			throw new Error('Auth client can only be used in the browser');
		}
		_authClient = createAuthClient(`${window.location.origin}/api/auth`);
	}
	return _authClient;
}

/**
 * Auth client proxy that lazily initializes the real client.
 * This allows the module to be imported during SSR without errors,
 * while still providing type-safe access to auth methods.
 */
export const authClient = new Proxy({} as AuthClient, {
	get(_target, prop) {
		return getAuthClient()[prop as keyof AuthClient];
	}
});

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
