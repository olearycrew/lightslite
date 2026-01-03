/**
 * App layout server load function
 *
 * Requires authentication for all /app routes.
 * Redirects to /auth/sign-in if not authenticated.
 */
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Require authentication
	if (!locals.session || !locals.user) {
		throw redirect(303, '/auth/sign-in');
	}

	return {
		user: locals.user,
		session: locals.session
	};
};
