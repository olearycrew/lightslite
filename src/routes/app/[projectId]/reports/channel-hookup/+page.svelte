<script lang="ts">
	/**
	 * Channel Hookup Report Page
	 *
	 * Displays the channel hookup report for a project with navigation
	 * back to the editor and PDF/CSV export functionality.
	 */
	import type { PageData } from './$types';
	import ChannelHookup from '$lib/components/reports/ChannelHookup.svelte';
	import { Button } from '$lib/components/ui/button';
	import { exportToPDF, downloadChannelHookupCSV } from '$lib/reports';

	let { data }: { data: PageData } = $props();

	/**
	 * Export report to PDF using browser print dialog
	 */
	function handleExportPDF() {
		exportToPDF({
			title: `Channel Hookup - ${data.report.projectName}`,
			filename: `channel-hookup-${data.report.projectName}`
		});
	}

	/**
	 * Export report to CSV file download
	 */
	function handleExportCSV() {
		downloadChannelHookupCSV(data.report);
	}
</script>

<svelte:head>
	<title>Channel Hookup - {data.report.projectName}</title>
</svelte:head>

<div class="report-page">
	<nav class="report-nav no-print">
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
		<div class="nav-actions">
			<Button variant="outline" onclick={handleExportCSV}>
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
				Export CSV
			</Button>
			<Button variant="outline" onclick={handleExportPDF}>
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
					<line x1="16" y1="13" x2="8" y2="13" />
					<line x1="16" y1="17" x2="8" y2="17" />
					<polyline points="10 9 9 9 8 9" />
				</svg>
				Export PDF
			</Button>
		</div>
	</nav>

	<main class="report-content">
		<ChannelHookup report={data.report} />
	</main>
</div>

<style>
	.report-page {
		min-height: 100vh;
		background: var(--color-bg, #1e1e2e);
	}

	/* Navigation bar */
	.report-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
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

	.nav-actions {
		display: flex;
		gap: 0.75rem;
	}

	/* Main content */
	.report-content {
		padding: 1rem;
	}

	/* Print styles */
	@media print {
		.no-print {
			display: none !important;
		}

		.report-page {
			background: #fff;
		}

		.report-content {
			padding: 0;
		}
	}
</style>
