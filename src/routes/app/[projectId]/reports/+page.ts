/**
 * Reports Index Page Load
 *
 * Fetches project information and all report data for the reports index page.
 * This enables CSV export directly from the index without navigating to individual reports.
 */
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { ChannelHookupReport } from '$lib/reports/generators/channel-hookup';
import type { InstrumentScheduleReport } from '$lib/reports/generators/instrument-schedule';
import type { DimmerScheduleReport } from '$lib/reports/generators/dimmer-schedule';

export interface ReportsPageData {
	projectId: string;
	projectName: string;
	reports: {
		channelHookup: ChannelHookupReport | null;
		instrumentSchedule: InstrumentScheduleReport | null;
		dimmerSchedule: DimmerScheduleReport | null;
	};
}

export const load: PageLoad = async ({ params, fetch }): Promise<ReportsPageData> => {
	// Fetch project details to get the project name
	const response = await fetch(`/api/projects/${params.projectId}`);

	if (!response.ok) {
		if (response.status === 404) {
			throw error(404, 'Project not found');
		}
		throw error(response.status, 'Failed to load project');
	}

	const data = await response.json();
	const projectName = data.project?.name || 'Untitled Project';

	// Fetch all reports in parallel for CSV export availability
	const [channelHookupRes, instrumentScheduleRes, dimmerScheduleRes] = await Promise.all([
		fetch(`/api/projects/${params.projectId}/reports/channel-hookup`),
		fetch(`/api/projects/${params.projectId}/reports/instrument-schedule`),
		fetch(`/api/projects/${params.projectId}/reports/dimmer-schedule`)
	]);

	// Parse responses (gracefully handle failures)
	const channelHookup = channelHookupRes.ok
		? ((await channelHookupRes.json()) as ChannelHookupReport)
		: null;
	const instrumentSchedule = instrumentScheduleRes.ok
		? ((await instrumentScheduleRes.json()) as InstrumentScheduleReport)
		: null;
	const dimmerSchedule = dimmerScheduleRes.ok
		? ((await dimmerScheduleRes.json()) as DimmerScheduleReport)
		: null;

	return {
		projectId: params.projectId,
		projectName,
		reports: {
			channelHookup,
			instrumentSchedule,
			dimmerSchedule
		}
	};
};
