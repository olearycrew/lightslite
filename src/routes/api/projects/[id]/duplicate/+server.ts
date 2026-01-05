/**
 * Project Duplicate API
 *
 * POST /api/projects/[id]/duplicate - Create a copy of a project
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { projects } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * POST - Duplicate a project
 */
export const POST: RequestHandler = async ({ params, locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Check that source project exists and belongs to user
		const [source] = await db
			.select()
			.from(projects)
			.where(and(eq(projects.id, params.id), eq(projects.userId, locals.user.id)))
			.limit(1);

		if (!source) {
			return json({ error: 'Project not found' }, { status: 404 });
		}

		// Create duplicate with new ID and modified name
		const duplicateName = `${source.name} (Copy)`;

		const [duplicate] = await db
			.insert(projects)
			.values({
				id: randomUUID(),
				userId: locals.user.id,
				name: duplicateName,
				venue: source.venue,
				scale: source.scale,
				layers: source.layers,
				metadata: source.metadata,
				version: 1
			})
			.returning();

		console.log('[API] Duplicate project created', {
			sourceId: params.id,
			newId: duplicate.id,
			name: duplicateName
		});

		return json({ project: duplicate });
	} catch (error) {
		console.error('[API] Failed to duplicate project:', error);
		return json({ error: 'Failed to duplicate project' }, { status: 500 });
	}
};
