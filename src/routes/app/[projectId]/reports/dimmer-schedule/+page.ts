/**
 * Dimmer Schedule Report Page Load
 *
 * Fetches the dimmer schedule report data from the API.
 */
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { DimmerScheduleReport } from '$lib/reports';

export const load: PageLoad = async ({ params, fetch }) => {
	const response = await fetch(`/api/projects/${params.projectId}/reports/dimmer-schedule`);

	if (!response.ok) {
		if (response.status === 404) {
			throw error(404, 'Project not found');
		}
		throw error(response.status, 'Failed to load dimmer schedule report');
	}

	const data = await response.json();
	return {
		report: data.report as DimmerScheduleReport,
		projectId: params.projectId
	};
};
