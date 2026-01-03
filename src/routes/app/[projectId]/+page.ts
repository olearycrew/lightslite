/**
 * Project Editor page load function
 *
 * Loads project data from the API.
 */
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const response = await fetch(`/api/projects/${params.projectId}`);

	if (!response.ok) {
		if (response.status === 404) {
			throw error(404, 'Project not found');
		}
		throw error(response.status, 'Failed to load project');
	}

	const data = await response.json();
	return {
		project: data.project
	};
};
