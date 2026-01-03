/**
 * Root layout server load function
 *
 * Passes session data to all pages in the application.
 * The session is verified in hooks.server.ts and stored in locals.
 */
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		session: locals.session,
		user: locals.user
	};
};
