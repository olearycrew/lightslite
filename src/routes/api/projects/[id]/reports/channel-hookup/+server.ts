/**
 * Channel Hookup Report API Endpoint
 *
 * GET /api/projects/[id]/reports/channel-hookup - Get the channel hookup report data
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { projects } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateChannelHookup, type ProjectLayers } from '$lib/reports';

/**
 * GET - Generate and return the channel hookup report
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Fetch the project
		const [project] = await db
			.select()
			.from(projects)
			.where(and(eq(projects.id, params.id), eq(projects.userId, locals.user.id)))
			.limit(1);

		if (!project) {
			return json({ error: 'Project not found' }, { status: 404 });
		}

		// Generate the channel hookup report
		const report = generateChannelHookup(project.name, project.layers as ProjectLayers | null);

		return json({ report });
	} catch (error) {
		console.error('[API] Failed to generate channel hookup report:', error);
		return json({ error: 'Failed to generate report' }, { status: 500 });
	}
};
