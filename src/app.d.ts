// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { BetterAuthSession, BetterAuthUser } from '@neondatabase/auth/types';

declare global {
	namespace App {
		// interface Error {}

		/**
		 * App.Locals contains data that is available throughout the request lifecycle
		 */
		interface Locals {
			/** Current authenticated session, or null if not authenticated */
			session: BetterAuthSession | null;
			/** Current authenticated user, or null if not authenticated */
			user: BetterAuthUser | null;
		}

		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Declare private environment variables for type checking
// These are only available on the server side
declare module '$env/static/private' {
	/** Database connection string from Neon */
	export const DATABASE_URL: string;
	/** Neon Auth server URL for server-side authentication */
	export const NEON_AUTH_BASE_URL: string;
}

// Declare public environment variables for type checking
// These are available on both client and server
declare module '$env/static/public' {
	/** Public Neon Auth URL for client-side authentication */
	export const PUBLIC_NEON_AUTH_URL: string;
}

export {};
