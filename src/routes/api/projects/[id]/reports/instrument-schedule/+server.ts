/**
 * Instrument Schedule Report API Endpoint
 *
 * GET /api/projects/[id]/reports/instrument-schedule - Get the instrument schedule report data
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { projects } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateInstrumentSchedule, type ProjectLayers } from '$lib/reports';

/**
 * GET - Generate and return the instrument schedule report
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

		// Generate the instrument schedule report
		const report = generateInstrumentSchedule(project.name, project.layers as ProjectLayers | null);

		return json({ report });
	} catch (error) {
		console.error('[API] Failed to generate instrument schedule report:', error);
		return json({ error: 'Failed to generate report' }, { status: 500 });
	}
};
