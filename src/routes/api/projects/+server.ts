/**
 * Projects API - List and Create
 *
 * GET /api/projects - List all projects for the authenticated user
 * POST /api/projects - Create a new project
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { projects } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET - List all projects for the current user
 */
export const GET: RequestHandler = async ({ locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userProjects = await db
			.select({
				id: projects.id,
				name: projects.name,
				updatedAt: projects.updatedAt,
				createdAt: projects.createdAt,
				version: projects.version
			})
			.from(projects)
			.where(eq(projects.userId, locals.user.id))
			.orderBy(desc(projects.updatedAt));

		return json({ projects: userProjects });
	} catch (error) {
		console.error('[API] Failed to list projects:', error);
		return json({ error: 'Failed to load projects' }, { status: 500 });
	}
};

/**
 * POST - Create a new project
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();

		// Validate input
		if (!body.name || typeof body.name !== 'string') {
			return json({ error: 'Project name is required' }, { status: 400 });
		}

		const name = body.name.trim();
		if (name.length === 0 || name.length > 255) {
			return json({ error: 'Project name must be between 1 and 255 characters' }, { status: 400 });
		}

		// Extract optional fields
		const venue = body.venue ?? null;
		const scale = body.scale ?? { unit: 'feet', pixelsPerUnit: 10 };

		// Create the project
		const [newProject] = await db
			.insert(projects)
			.values({
				userId: locals.user.id,
				name,
				venue,
				scale,
				layers: {
					instruments: [],
					hangingPositions: [],
					shapes: []
				},
				metadata: { createdWith: 'LightsLite' }
			})
			.returning({
				id: projects.id,
				name: projects.name,
				updatedAt: projects.updatedAt,
				createdAt: projects.createdAt,
				version: projects.version
			});

		return json({ project: newProject }, { status: 201 });
	} catch (error) {
		console.error('[API] Failed to create project:', error);
		return json({ error: 'Failed to create project' }, { status: 500 });
	}
};
