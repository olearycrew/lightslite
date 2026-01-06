/**
 * Layer Templates API - CRUD operations for layer templates
 *
 * GET /api/templates - List all templates for the current user
 * POST /api/templates - Create a new template
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { layerTemplates } from '$lib/db/schema';
import { eq, or } from 'drizzle-orm';

/**
 * GET - List all templates for the current user
 * Includes both user's private templates and global templates
 */
export const GET: RequestHandler = async ({ locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const templates = await db
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
			.where(or(eq(layerTemplates.userId, locals.user.id), eq(layerTemplates.isGlobal, 'y')))
			.orderBy(layerTemplates.name);

		return json({ templates });
	} catch (error) {
		console.error('[API] Failed to list templates:', error);
		return json({ error: 'Failed to load templates' }, { status: 500 });
	}
};

/**
 * POST - Create a new layer template
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
			return json({ error: 'Template name is required' }, { status: 400 });
		}

		if (!body.layerData || typeof body.layerData !== 'object') {
			return json({ error: 'Layer data is required' }, { status: 400 });
		}

		const name = body.name.trim();
		if (name.length === 0 || name.length > 255) {
			return json({ error: 'Template name must be between 1 and 255 characters' }, { status: 400 });
		}

		// Extract optional fields
		const description = body.description?.trim() || null;
		const type = body.type || 'all';
		const isGlobal = body.isGlobal === true ? 'y' : 'n';

		// Create the template
		const [newTemplate] = await db
			.insert(layerTemplates)
			.values({
				userId: locals.user.id,
				name,
				description,
				type,
				layerData: body.layerData,
				isGlobal
			})
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

		return json({ template: newTemplate }, { status: 201 });
	} catch (error) {
		console.error('[API] Failed to create template:', error);
		return json({ error: 'Failed to create template' }, { status: 500 });
	}
};
