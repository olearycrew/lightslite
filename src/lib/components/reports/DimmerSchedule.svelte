<script lang="ts">
	/**
	 * Dimmer Schedule Report Component
	 *
	 * Displays the dimmer schedule report data grouped by dimmer.
	 * Shows load totals for power planning.
	 * Styled for both on-screen viewing and printing.
	 */
	import type { DimmerScheduleReport } from '$lib/reports';

	interface Props {
		report: DimmerScheduleReport;
	}

	let { report }: Props = $props();

	/**
	 * Format a date string for display
	 */
	function formatDate(isoString: string): string {
		const date = new Date(isoString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	/**
	 * Format a cell value, returning a dash for null/empty values
	 */
	function formatCell(value: string | number | null): string {
		if (value === null || value === undefined || value === '') {
			return '—';
		}
		return String(value);
	}

	/**
	 * Format wattage for display with "W" suffix
	 */
	function formatWattage(wattage: number | null): string {
		if (wattage === null || wattage === undefined) {
			return '—';
		}
		return `${wattage.toLocaleString()}W`;
	}

	/**
	 * Format total load with kilowatt conversion for large values
	 */
	function formatTotalLoad(watts: number | null): string {
		if (watts === null || watts === undefined) {
			return '—';
		}
		if (watts >= 1000) {
			return `${(watts / 1000).toFixed(1)}kW`;
		}
		return `${watts}W`;
	}
</script>

<div class="dimmer-schedule-report">
	<header class="report-header">
		<h1>Dimmer Schedule</h1>
		<div class="report-meta">
			<p class="project-name">{report.projectName}</p>
			<p class="generated-date">Generated: {formatDate(report.generatedAt)}</p>
		</div>
	</header>

	<section class="report-summary">
		<div class="summary-item">
			<span class="summary-label">Total Instruments</span>
			<span class="summary-value">{report.summary.totalInstruments}</span>
		</div>
		<div class="summary-item">
			<span class="summary-label">Dimmers Used</span>
			<span class="summary-value">{report.summary.totalDimmers}</span>
		</div>
		<div class="summary-item">
			<span class="summary-label">Assigned</span>
			<span class="summary-value">{report.summary.assignedCount}</span>
		</div>
		<div class="summary-item">
			<span class="summary-label">Unassigned</span>
			<span class="summary-value">{report.summary.unassignedCount}</span>
		</div>
		{#if report.summary.totalEstimatedLoad !== null}
			<div class="summary-item load-total">
				<span class="summary-label">Est. Total Load</span>
				<span class="summary-value">{formatTotalLoad(report.summary.totalEstimatedLoad)}</span>
			</div>
		{/if}
	</section>

	{#if report.dimmerGroups.length === 0 && report.unassignedInstruments.length === 0}
		<div class="empty-state">
			<p>No instruments in this project.</p>
			<p class="empty-hint">Add instruments to your lighting plot to see them here.</p>
		</div>
	{:else}
		<!-- Dimmer groups -->
		{#each report.dimmerGroups as group (group.dimmer)}
			<section class="dimmer-section">
				<div class="dimmer-header">
					<h2>Dimmer {group.dimmer}</h2>
					{#if group.totalLoad !== null}
						<span class="dimmer-load">{formatTotalLoad(group.totalLoad)}</span>
					{/if}
				</div>
				<div class="table-container">
					<table class="schedule-table">
						<thead>
							<tr>
								<th class="col-channel">Chan</th>
								<th class="col-position">Position</th>
								<th class="col-unit">Unit #</th>
								<th class="col-type">Instrument Type</th>
								<th class="col-circuit">Circuit</th>
								<th class="col-purpose">Purpose</th>
								<th class="col-wattage">Watts</th>
							</tr>
						</thead>
						<tbody>
							{#each group.instruments as row (row.instrumentId)}
								<tr>
									<td class="col-channel">{formatCell(row.channel)}</td>
									<td class="col-position">{row.position}</td>
									<td class="col-unit">{formatCell(row.unitNumber)}</td>
									<td class="col-type">{row.instrumentType}</td>
									<td class="col-circuit">{formatCell(row.circuit)}</td>
									<td class="col-purpose">{formatCell(row.purpose)}</td>
									<td class="col-wattage">{formatWattage(row.wattage)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/each}

		<!-- Unassigned instruments -->
		{#if report.unassignedInstruments.length > 0}
			<section class="dimmer-section unassigned-section">
				<h2 class="dimmer-header unassigned-header">Unassigned (No Dimmer)</h2>
				<div class="table-container">
					<table class="schedule-table">
						<thead>
							<tr>
								<th class="col-channel">Chan</th>
								<th class="col-position">Position</th>
								<th class="col-unit">Unit #</th>
								<th class="col-type">Instrument Type</th>
								<th class="col-circuit">Circuit</th>
								<th class="col-purpose">Purpose</th>
								<th class="col-wattage">Watts</th>
							</tr>
						</thead>
						<tbody>
							{#each report.unassignedInstruments as row (row.instrumentId)}
								<tr>
									<td class="col-channel">{formatCell(row.channel)}</td>
									<td class="col-position">{row.position}</td>
									<td class="col-unit">{formatCell(row.unitNumber)}</td>
									<td class="col-type">{row.instrumentType}</td>
									<td class="col-circuit">{formatCell(row.circuit)}</td>
									<td class="col-purpose">{formatCell(row.purpose)}</td>
									<td class="col-wattage">{formatWattage(row.wattage)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}
	{/if}
</div>

<style>
	.dimmer-schedule-report {
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Oxygen,
			Ubuntu,
			sans-serif;
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
		color: var(--color-text, #cdd6f4);
		background: var(--color-bg, #1e1e2e);
	}

	/* Header */
	.report-header {
		margin-bottom: 2rem;
		border-bottom: 2px solid var(--color-border, #45475a);
		padding-bottom: 1rem;
	}

	.report-header h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 600;
		color: var(--color-heading, #cba6f7);
	}

	.report-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: space-between;
		opacity: 0.8;
	}

	.project-name {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 500;
	}

	.generated-date {
		margin: 0;
		font-size: 0.9rem;
	}

	/* Summary */
	.report-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding: 1rem;
		background: var(--color-surface, #313244);
		border-radius: 8px;
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.summary-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.7;
	}

	.summary-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-accent, #89b4fa);
	}

	.load-total .summary-value {
		color: var(--color-warning, #f9e2af);
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 3rem;
		background: var(--color-surface, #313244);
		border-radius: 8px;
	}

	.empty-state p {
		margin: 0;
	}

	.empty-hint {
		margin-top: 0.5rem !important;
		opacity: 0.7;
		font-size: 0.9rem;
	}

	/* Dimmer sections */
	.dimmer-section {
		margin-bottom: 2rem;
	}

	.dimmer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 0.75rem;
		padding-left: 0.5rem;
		border-left: 4px solid var(--color-accent, #89b4fa);
	}

	.dimmer-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-heading, #f5c2e7);
	}

	.dimmer-load {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-warning, #f9e2af);
		background: var(--color-surface, #313244);
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
	}

	.unassigned-section .dimmer-header,
	.unassigned-header {
		border-left-color: var(--color-warning, #f9e2af);
	}

	.unassigned-header {
		color: var(--color-warning, #f9e2af);
		margin: 0 0 0.75rem;
		padding-left: 0.5rem;
		border-left: 4px solid var(--color-warning, #f9e2af);
		font-size: 1.25rem;
		font-weight: 600;
	}

	/* Table */
	.table-container {
		overflow-x: auto;
		border-radius: 8px;
		border: 1px solid var(--color-border, #45475a);
	}

	.schedule-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	.schedule-table thead {
		background: var(--color-surface, #313244);
		position: sticky;
		top: 0;
	}

	.schedule-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		font-weight: 600;
		white-space: nowrap;
		border-bottom: 2px solid var(--color-border, #45475a);
	}

	.schedule-table td {
		padding: 0.5rem 1rem;
		border-bottom: 1px solid var(--color-border, #45475a);
		vertical-align: top;
	}

	.schedule-table tbody tr:hover {
		background: var(--color-surface-hover, #45475a);
	}

	/* Column widths and alignment */
	.col-channel,
	.col-unit,
	.col-circuit {
		text-align: center;
		width: 60px;
	}

	.col-wattage {
		text-align: right;
		width: 80px;
	}

	.col-type {
		min-width: 120px;
	}

	.col-position {
		min-width: 100px;
	}

	.col-purpose {
		min-width: 120px;
		max-width: 200px;
	}

	/* Print styles */
	@media print {
		.dimmer-schedule-report {
			max-width: none;
			padding: 0;
			color: #000;
			background: #fff;
		}

		.report-header h1 {
			color: #000;
		}

		.report-summary {
			background: #f5f5f5;
		}

		.summary-value {
			color: #333;
		}

		.load-total .summary-value {
			color: #856404;
		}

		.dimmer-header {
			border-left-color: #666;
		}

		.dimmer-header h2 {
			color: #333;
		}

		.dimmer-load {
			color: #856404;
			background: #f5f5f5;
		}

		.unassigned-section .dimmer-header,
		.unassigned-header {
			color: #856404;
			border-left-color: #856404;
		}

		.table-container {
			border-color: #ccc;
			overflow: visible;
		}

		.schedule-table thead {
			background: #f0f0f0;
		}

		.schedule-table th,
		.schedule-table td {
			border-color: #ccc;
		}

		.schedule-table tbody tr:hover {
			background: transparent;
		}

		/* Page breaks */
		.dimmer-section {
			page-break-inside: avoid;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.dimmer-schedule-report {
			padding: 0.5rem;
		}

		.report-header h1 {
			font-size: 1.5rem;
		}

		.report-summary {
			padding: 0.75rem;
			gap: 1rem;
		}

		.summary-value {
			font-size: 1.25rem;
		}

		.dimmer-header h2 {
			font-size: 1.1rem;
		}

		.schedule-table th,
		.schedule-table td {
			padding: 0.5rem;
			font-size: 0.8rem;
		}

		/* Hide less critical columns on mobile */
		.col-wattage {
			display: none;
		}
	}
</style>
