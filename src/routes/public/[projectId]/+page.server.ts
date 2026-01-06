/**
 * Public Project View - Server Load
 *
 * View a project without authentication.
 * This route is publicly accessible and provides read-only access to projects.
 */
import { json } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { projects } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const [project] = await db
			.select({
				id: projects.id,
				name: projects.name,
				venue: projects.venue,
				scale: projects.scale,
				layers: projects.layers,
				createdAt: projects.createdAt,
				updatedAt: projects.updatedAt
			})
			.from(projects)
			.where(eq(projects.id, params.projectId))
			.limit(1);

		if (!project) {
			return json({ error: 'Project not found' }, { status: 404 });
		}

		return {
			project,
			publicView: true
		};
	} catch (error) {
		console.error('[Public] Failed to load project:', error);
		return json({ error: 'Failed to load project' }, { status: 500 });
	}
};
