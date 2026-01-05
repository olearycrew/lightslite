/**
 * App Dashboard Server Load
 *
 * Loads user's projects from database for server-side rendering.
 * Includes project metadata and instrument count for display.
 */
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { projects } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Layers structure from projects table
 */
interface ProjectLayers {
	instruments?: Array<{ id: string }>;
	hangingPositions?: Array<{ id: string }>;
	shapes?: Array<{ id: string }>;
}

export const load: PageServerLoad = async ({ locals }) => {
	// User is guaranteed to exist by layout auth check
	const userId = locals.user!.id;

	try {
		const userProjects = await db
			.select({
				id: projects.id,
				name: projects.name,
				updatedAt: projects.updatedAt,
				createdAt: projects.createdAt,
				version: projects.version,
				layers: projects.layers,
				scale: projects.scale,
				venue: projects.venue
			})
			.from(projects)
			.where(eq(projects.userId, userId))
			.orderBy(desc(projects.updatedAt));

		// Transform projects to include computed fields
		const projectsWithStats = userProjects.map((project) => {
			const layers = project.layers as ProjectLayers | null;
			const instrumentCount = layers?.instruments?.length ?? 0;
			const positionCount = layers?.hangingPositions?.length ?? 0;

			return {
				id: project.id,
				name: project.name,
				updatedAt: project.updatedAt.toISOString(),
				createdAt: project.createdAt.toISOString(),
				version: project.version,
				instrumentCount,
				positionCount,
				scale: project.scale as { unit: string; pixelsPerUnit: number } | null,
				venue: project.venue as { name?: string } | null
			};
		});

		return {
			projects: projectsWithStats
		};
	} catch (error) {
		console.error('[App] Failed to load projects:', error);
		return {
			projects: []
		};
	}
};
