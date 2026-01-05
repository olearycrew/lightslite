<script lang="ts">
	/**
	 * Channel Hookup Report Page
	 *
	 * Displays the channel hookup report for a project with navigation
	 * back to the editor and print functionality.
	 */
	import type { PageData } from './$types';
	import ChannelHookup from '$lib/components/reports/ChannelHookup.svelte';
	import { Button } from '$lib/components/ui/button';

	let { data }: { data: PageData } = $props();

	/**
	 * Print the report
	 */
	function handlePrint() {
		window.print();
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
			<Button variant="outline" onclick={handlePrint}>
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
					<polyline points="6 9 6 2 18 2 18 9" />
					<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
					<rect x="6" y="14" width="12" height="8" />
				</svg>
				Print Report
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
