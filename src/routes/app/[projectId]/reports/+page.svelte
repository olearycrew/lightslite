<script lang="ts">
	/**
	 * Reports Index Page
	 *
	 * Lists all available reports for a project with links to view each report
	 * and quick export buttons for PDF and CSV generation.
	 */
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import {
		REPORTS,
		getReportUrl,
		downloadChannelHookupCSV,
		downloadInstrumentScheduleCSV,
		downloadDimmerScheduleCSV
	} from '$lib/reports';
	import type { ReportType } from '$lib/reports';

	let { data }: { data: PageData } = $props();

	/**
	 * Handle CSV export for a specific report type
	 */
	function handleExportCSV(reportType: ReportType) {
		switch (reportType) {
			case 'channel-hookup':
				if (data.reports.channelHookup) {
					downloadChannelHookupCSV(data.reports.channelHookup);
				}
				break;
			case 'instrument-schedule':
				if (data.reports.instrumentSchedule) {
					downloadInstrumentScheduleCSV(data.reports.instrumentSchedule);
				}
				break;
			case 'dimmer-schedule':
				if (data.reports.dimmerSchedule) {
					downloadDimmerScheduleCSV(data.reports.dimmerSchedule);
				}
				break;
		}
	}

	/**
	 * Check if CSV export is available for a report type
	 */
	function isCSVAvailable(reportType: ReportType): boolean {
		switch (reportType) {
			case 'channel-hookup':
				return data.reports.channelHookup !== null;
			case 'instrument-schedule':
				return data.reports.instrumentSchedule !== null;
			case 'dimmer-schedule':
				return data.reports.dimmerSchedule !== null;
			default:
				return false;
		}
	}
</script>

<svelte:head>
	<title>Reports - {data.projectName}</title>
</svelte:head>

<div class="reports-page">
	<nav class="reports-nav">
		<a href="/app/{data.projectId}" class="back-link">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
			Back to Editor
		</a>
	</nav>

	<main class="reports-content">
		<header class="reports-header">
			<h1>Reports</h1>
			<p class="project-name">{data.projectName}</p>
		</header>

		<div class="reports-grid">
			{#each REPORTS as report (report.type)}
				<div class="report-card">
					<div class="report-icon">
						{#if report.icon === 'file-text'}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
								<line x1="16" y1="13" x2="8" y2="13" />
								<line x1="16" y1="17" x2="8" y2="17" />
								<polyline points="10 9 9 9 8 9" />
							</svg>
						{:else if report.icon === 'list'}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="8" y1="6" x2="21" y2="6" />
								<line x1="8" y1="12" x2="21" y2="12" />
								<line x1="8" y1="18" x2="21" y2="18" />
								<line x1="3" y1="6" x2="3.01" y2="6" />
								<line x1="3" y1="12" x2="3.01" y2="12" />
								<line x1="3" y1="18" x2="3.01" y2="18" />
							</svg>
						{:else if report.icon === 'sliders'}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="4" y1="21" x2="4" y2="14" />
								<line x1="4" y1="10" x2="4" y2="3" />
								<line x1="12" y1="21" x2="12" y2="12" />
								<line x1="12" y1="8" x2="12" y2="3" />
								<line x1="20" y1="21" x2="20" y2="16" />
								<line x1="20" y1="12" x2="20" y2="3" />
								<line x1="1" y1="14" x2="7" y2="14" />
								<line x1="9" y1="8" x2="15" y2="8" />
								<line x1="17" y1="16" x2="23" y2="16" />
							</svg>
						{/if}
					</div>
					<div class="report-info">
						<h2>{report.name}</h2>
						<p>{report.description}</p>
					</div>
					<div class="report-actions">
						<Button variant="default" href={getReportUrl(data.projectId, report.type)}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
								<circle cx="12" cy="12" r="3" />
							</svg>
							View Report
						</Button>
						<Button
							variant="outline"
							onclick={() => handleExportCSV(report.type)}
							disabled={!isCSVAvailable(report.type)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
								<line x1="12" y1="18" x2="12" y2="12" />
								<path d="M9 15l3 3 3-3" />
							</svg>
							CSV
						</Button>
					</div>
				</div>
			{/each}
		</div>
	</main>
</div>

<style>
	.reports-page {
		min-height: 100vh;
		background: var(--color-bg, #1e1e2e);
	}

	/* Navigation bar */
	.reports-nav {
		display: flex;
		align-items: center;
		padding: 1rem 1.5rem;
		background: var(--color-surface, #313244);
		border-bottom: 1px solid var(--color-border, #45475a);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-text, #cdd6f4);
		text-decoration: none;
		font-weight: 500;
		transition: color 0.15s ease;
	}

	.back-link:hover {
		color: var(--color-accent, #89b4fa);
	}

	/* Main content */
	.reports-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.reports-header {
		margin-bottom: 2rem;
	}

	.reports-header h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 600;
		color: var(--color-heading, #cba6f7);
	}

	.project-name {
		margin: 0;
		font-size: 1.1rem;
		opacity: 0.8;
		color: var(--color-text, #cdd6f4);
	}

	/* Reports grid */
	.reports-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.report-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		background: var(--color-surface, #313244);
		border: 1px solid var(--color-border, #45475a);
		border-radius: 12px;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.report-card:hover {
		border-color: var(--color-accent, #89b4fa);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.report-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		background: var(--color-bg, #1e1e2e);
		border-radius: 12px;
		color: var(--color-accent, #89b4fa);
	}

	.report-info {
		flex: 1;
	}

	.report-info h2 {
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text, #cdd6f4);
	}

	.report-info p {
		margin: 0;
		font-size: 0.9rem;
		opacity: 0.7;
		color: var(--color-text, #cdd6f4);
	}

	.report-actions {
		display: flex;
		gap: 0.75rem;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.reports-content {
			padding: 1rem;
		}

		.reports-header h1 {
			font-size: 1.5rem;
		}

		.reports-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
