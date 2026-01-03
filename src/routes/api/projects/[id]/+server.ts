/**
 * Single Project API - CRUD operations
 *
 * GET /api/projects/[id] - Get a single project
 * PUT /api/projects/[id] - Update a project
 * DELETE /api/projects/[id] - Delete a project
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { projects } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET - Retrieve a single project
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const [project] = await db
			.select()
			.from(projects)
			.where(and(eq(projects.id, params.id), eq(projects.userId, locals.user.id)))
			.limit(1);

		if (!project) {
			return json({ error: 'Project not found' }, { status: 404 });
		}

		return json({ project });
	} catch (error) {
		console.error('[API] Failed to get project:', error);
		return json({ error: 'Failed to load project' }, { status: 500 });
	}
};

/**
 * PUT - Update a project
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();

		// Build update object with only provided fields
		const updates: Record<string, unknown> = {};

		if (body.name !== undefined) {
			if (typeof body.name !== 'string' || body.name.trim().length === 0) {
				return json({ error: 'Invalid project name' }, { status: 400 });
			}
			updates.name = body.name.trim();
		}

		if (body.venue !== undefined) {
			updates.venue = body.venue;
		}

		if (body.scale !== undefined) {
			updates.scale = body.scale;
		}

		if (body.layers !== undefined) {
			updates.layers = body.layers;
		}

		if (body.metadata !== undefined) {
			updates.metadata = body.metadata;
		}

		// Check that project exists and belongs to user
		const [existing] = await db
			.select({ id: projects.id })
			.from(projects)
			.where(and(eq(projects.id, params.id), eq(projects.userId, locals.user.id)))
			.limit(1);

		if (!existing) {
			return json({ error: 'Project not found' }, { status: 404 });
		}

		// Perform update
		const [updated] = await db
			.update(projects)
			.set(updates)
			.where(eq(projects.id, params.id))
			.returning();

		return json({ project: updated });
	} catch (error) {
		console.error('[API] Failed to update project:', error);
		return json({ error: 'Failed to update project' }, { status: 500 });
	}
};

/**
 * DELETE - Remove a project
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Check that project exists and belongs to user
		const [existing] = await db
			.select({ id: projects.id })
			.from(projects)
			.where(and(eq(projects.id, params.id), eq(projects.userId, locals.user.id)))
			.limit(1);

		if (!existing) {
			return json({ error: 'Project not found' }, { status: 404 });
		}

		// Delete the project (cascades to related tables)
		await db.delete(projects).where(eq(projects.id, params.id));

		return json({ success: true });
	} catch (error) {
		console.error('[API] Failed to delete project:', error);
		return json({ error: 'Failed to delete project' }, { status: 500 });
	}
};
