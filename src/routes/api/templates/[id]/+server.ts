/**
 * Single Template API - CRUD operations for a single template
 *
 * GET /api/templates/[id] - Get a template
 * PUT /api/templates/[id] - Update a template
 * DELETE /api/templates/[id] - Delete a template
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { layerTemplates } from '$lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

/**
 * GET - Retrieve a single template
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const [template] = await db
			.select({
				id: layerTemplates.id,
				name: layerTemplates.name,
				description: layerTemplates.description,
				type: layerTemplates.type,
				layerData: layerTemplates.layerData,
				isGlobal: layerTemplates.isGlobal,
				createdAt: layerTemplates.createdAt,
				updatedAt: layerTemplates.updatedAt
			})
			.from(layerTemplates)
			.where(
				and(
					eq(layerTemplates.id, params.id),
					or(eq(layerTemplates.userId, locals.user.id), eq(layerTemplates.isGlobal, 'y'))
				)
			)
			.limit(1);

		if (!template) {
			return json({ error: 'Template not found' }, { status: 404 });
		}

		return json({ template });
	} catch (error) {
		console.error('[API] Failed to get template:', error);
		return json({ error: 'Failed to load template' }, { status: 500 });
	}
};

/**
 * PUT - Update a template
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();

		// Check that template exists and belongs to user (can't edit global templates)
		const [existing] = await db
			.select({ id: layerTemplates.id, isGlobal: layerTemplates.isGlobal })
			.from(layerTemplates)
			.where(and(eq(layerTemplates.id, params.id), eq(layerTemplates.userId, locals.user.id)))
			.limit(1);

		if (!existing) {
			return json({ error: 'Template not found' }, { status: 404 });
		}

		if (existing.isGlobal === 'y') {
			return json({ error: 'Cannot modify global templates' }, { status: 403 });
		}

		// Build update object
		const updates: Record<string, unknown> = {};

		if (body.name !== undefined) {
			const name = body.name.trim();
			if (name.length === 0 || name.length > 255) {
				return json(
					{ error: 'Template name must be between 1 and 255 characters' },
					{ status: 400 }
				);
			}
			updates.name = name;
		}

		if (body.description !== undefined) {
			updates.description = body.description?.trim() || null;
		}

		if (body.type !== undefined) {
			updates.type = body.type;
		}

		if (body.layerData !== undefined) {
			updates.layerData = body.layerData;
		}

		const [updated] = await db
			.update(layerTemplates)
			.set(updates)
			.where(eq(layerTemplates.id, params.id))
			.returning({
				id: layerTemplates.id,
				name: layerTemplates.name,
				description: layerTemplates.description,
				type: layerTemplates.type,
				layerData: layerTemplates.layerData,
				isGlobal: layerTemplates.isGlobal,
				createdAt: layerTemplates.createdAt,
				updatedAt: layerTemplates.updatedAt
			});

		return json({ template: updated });
	} catch (error) {
		console.error('[API] Failed to update template:', error);
		return json({ error: 'Failed to update template' }, { status: 500 });
	}
};

/**
 * DELETE - Remove a template
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Check that template exists and belongs to user (can't delete global templates)
		const [existing] = await db
			.select({ id: layerTemplates.id, isGlobal: layerTemplates.isGlobal })
			.from(layerTemplates)
			.where(and(eq(layerTemplates.id, params.id), eq(layerTemplates.userId, locals.user.id)))
			.limit(1);

		if (!existing) {
			return json({ error: 'Template not found' }, { status: 404 });
		}

		if (existing.isGlobal === 'y') {
			return json({ error: 'Cannot delete global templates' }, { status: 403 });
		}

		await db.delete(layerTemplates).where(eq(layerTemplates.id, params.id));

		return json({ success: true });
	} catch (error) {
		console.error('[API] Failed to delete template:', error);
		return json({ error: 'Failed to delete template' }, { status: 500 });
	}
};
