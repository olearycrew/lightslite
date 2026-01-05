/**
 * Reports Index Page Load
 *
 * Fetches project information for the reports index page.
 */
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	// Fetch project details to get the project name
	const response = await fetch(`/api/projects/${params.projectId}`);

	if (!response.ok) {
		if (response.status === 404) {
			throw error(404, 'Project not found');
		}
		throw error(response.status, 'Failed to load project');
	}

	const data = await response.json();
	return {
		projectId: params.projectId,
		projectName: data.project?.name || 'Untitled Project'
	};
};
