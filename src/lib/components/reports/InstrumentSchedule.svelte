<script lang="ts">
	/**
	 * Instrument Schedule Report Component
	 *
	 * Displays the instrument schedule report data grouped by position.
	 * Styled for both on-screen viewing and printing.
	 */
	import type { InstrumentScheduleReport } from '$lib/reports';

	interface Props {
		report: InstrumentScheduleReport;
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
</script>

<div class="instrument-schedule-report">
	<header class="report-header">
		<h1>Instrument Schedule</h1>
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
			<span class="summary-label">Positions</span>
			<span class="summary-value">{report.summary.totalPositions}</span>
		</div>
		<div class="summary-item">
			<span class="summary-label">Unassigned</span>
			<span class="summary-value">{report.summary.unassignedCount}</span>
		</div>
	</section>

	{#if report.positions.length === 0 && report.unassignedInstruments.length === 0}
		<div class="empty-state">
			<p>No instruments in this project.</p>
			<p class="empty-hint">Add instruments to your lighting plot to see them here.</p>
		</div>
	{:else}
		<!-- Positions with instruments -->
		{#each report.positions as position (position.positionId)}
			<section class="position-section">
				<h2 class="position-header">{position.positionName}</h2>
				<div class="table-container">
					<table class="schedule-table">
						<thead>
							<tr>
								<th class="col-unit">Unit #</th>
								<th class="col-type">Instrument Type</th>
								<th class="col-channel">Chan</th>
								<th class="col-dimmer">Dim</th>
								<th class="col-circuit">Cir</th>
								<th class="col-color">Color</th>
								<th class="col-gobo">Gobo</th>
								<th class="col-accessory">Accessory</th>
								<th class="col-purpose">Purpose</th>
								<th class="col-notes">Notes</th>
							</tr>
						</thead>
						<tbody>
							{#each position.instruments as row (row.instrumentId)}
								<tr>
									<td class="col-unit">{formatCell(row.unitNumber)}</td>
									<td class="col-type">{row.instrumentType}</td>
									<td class="col-channel">{formatCell(row.channel)}</td>
									<td class="col-dimmer">{formatCell(row.dimmer)}</td>
									<td class="col-circuit">{formatCell(row.circuit)}</td>
									<td class="col-color">{formatCell(row.color)}</td>
									<td class="col-gobo">{formatCell(row.gobo)}</td>
									<td class="col-accessory">{formatCell(row.accessory)}</td>
									<td class="col-purpose">{formatCell(row.purpose)}</td>
									<td class="col-notes">{formatCell(row.notes)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/each}

		<!-- Unassigned instruments -->
		{#if report.unassignedInstruments.length > 0}
			<section class="position-section unassigned-section">
				<h2 class="position-header">Unassigned Instruments</h2>
				<div class="table-container">
					<table class="schedule-table">
						<thead>
							<tr>
								<th class="col-unit">Unit #</th>
								<th class="col-type">Instrument Type</th>
								<th class="col-channel">Chan</th>
								<th class="col-dimmer">Dim</th>
								<th class="col-circuit">Cir</th>
								<th class="col-color">Color</th>
								<th class="col-gobo">Gobo</th>
								<th class="col-accessory">Accessory</th>
								<th class="col-purpose">Purpose</th>
								<th class="col-notes">Notes</th>
							</tr>
						</thead>
						<tbody>
							{#each report.unassignedInstruments as row (row.instrumentId)}
								<tr>
									<td class="col-unit">{formatCell(row.unitNumber)}</td>
									<td class="col-type">{row.instrumentType}</td>
									<td class="col-channel">{formatCell(row.channel)}</td>
									<td class="col-dimmer">{formatCell(row.dimmer)}</td>
									<td class="col-circuit">{formatCell(row.circuit)}</td>
									<td class="col-color">{formatCell(row.color)}</td>
									<td class="col-gobo">{formatCell(row.gobo)}</td>
									<td class="col-accessory">{formatCell(row.accessory)}</td>
									<td class="col-purpose">{formatCell(row.purpose)}</td>
									<td class="col-notes">{formatCell(row.notes)}</td>
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
	.instrument-schedule-report {
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Oxygen,
			Ubuntu,
			sans-serif;
		max-width: 1400px;
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

	/* Position sections */
	.position-section {
		margin-bottom: 2rem;
	}

	.position-header {
		margin: 0 0 0.75rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-heading, #f5c2e7);
		padding-left: 0.5rem;
		border-left: 4px solid var(--color-accent, #89b4fa);
	}

	.unassigned-section .position-header {
		color: var(--color-warning, #f9e2af);
		border-left-color: var(--color-warning, #f9e2af);
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
	.col-unit,
	.col-channel,
	.col-dimmer,
	.col-circuit {
		text-align: center;
		width: 60px;
	}

	.col-type {
		min-width: 120px;
	}

	.col-color,
	.col-gobo,
	.col-accessory {
		min-width: 80px;
	}

	.col-purpose {
		min-width: 120px;
	}

	.col-notes {
		min-width: 150px;
		max-width: 250px;
	}

	/* Print styles */
	@media print {
		.instrument-schedule-report {
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

		.position-header {
			color: #333;
			border-left-color: #666;
		}

		.unassigned-section .position-header {
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
		.position-section {
			page-break-inside: avoid;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.instrument-schedule-report {
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

		.position-header {
			font-size: 1.1rem;
		}

		.schedule-table th,
		.schedule-table td {
			padding: 0.5rem;
			font-size: 0.8rem;
		}

		/* Hide less critical columns on mobile */
		.col-gobo,
		.col-accessory,
		.col-notes {
			display: none;
		}
	}
</style>
