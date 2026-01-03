<script lang="ts">
	/**
	 * ProjectProperties Component
	 *
	 * Properties panel for editing project and venue settings.
	 * Shown when nothing is selected.
	 */
	import { project } from '$lib/stores/project.svelte';
	import { grid, type GridUnit, GRID_SPACING_PRESETS } from '$lib/stores/grid.svelte';
	import {
		FormField,
		NumberInput,
		TextInput,
		SelectDropdown,
		Checkbox,
		CollapsibleSection
	} from '../forms';

	// Local state for project settings
	let projectName = $state(project.projectName);
	let venueName = $state<string | null>(null);

	// Grid settings
	let gridUnit = $state<GridUnit>(grid.unit);
	let gridSpacing = $state(grid.spacing);
	let showGrid = $state(grid.showGrid);
	let snapToGrid = $state(grid.snapToGrid);
	let showCenterLine = $state(grid.showCenterLine);
	let showPlasterLine = $state(grid.showPlasterLine);

	// Unit options
	const unitOptions: Array<{ value: GridUnit; label: string }> = [
		{ value: 'feet', label: 'Feet' },
		{ value: 'meters', label: 'Meters' }
	];

	// Grid spacing preset options based on current unit
	const spacingPresets = $derived(
		GRID_SPACING_PRESETS.filter((p) => p.unit === gridUnit).map((p) => ({
			value: p.value,
			label: p.label
		}))
	);

	// Update project name
	$effect(() => {
		if (projectName !== project.projectName) {
			project.setProjectInfo(projectName, project.projectId ?? undefined);
		}
	});

	// Update grid settings
	$effect(() => {
		if (gridUnit !== grid.unit) {
			grid.setUnit(gridUnit);
		}
	});

	$effect(() => {
		if (gridSpacing !== grid.spacing) {
			grid.setSpacing(gridSpacing);
		}
	});

	$effect(() => {
		if (showGrid !== grid.showGrid) {
			grid.toggleGrid();
		}
	});

	$effect(() => {
		if (snapToGrid !== grid.snapToGrid) {
			grid.toggleSnap();
		}
	});

	$effect(() => {
		if (showCenterLine !== grid.showCenterLine) {
			grid.toggleCenterLine();
		}
	});

	$effect(() => {
		if (showPlasterLine !== grid.showPlasterLine) {
			grid.togglePlasterLine();
		}
	});

	// Summary statistics
	const stats = $derived({
		hangingPositions: project.hangingPositions.length,
		instruments: project.instruments.length,
		shapes: project.shapes.length
	});
</script>

<div class="project-properties">
	<CollapsibleSection title="Project">
		<FormField label="Name">
			<TextInput bind:value={projectName} placeholder="Project name" />
		</FormField>

		<FormField label="Venue">
			<TextInput bind:value={venueName} placeholder="Venue name" />
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Scale & Units">
		<FormField label="Unit">
			<SelectDropdown bind:value={gridUnit} options={unitOptions} />
		</FormField>

		<FormField label="Grid Spacing">
			<NumberInput
				bind:value={gridSpacing}
				min={0.1}
				max={10}
				step={0.5}
				unit={gridUnit === 'feet' ? 'ft' : 'm'}
			/>
		</FormField>

		<div class="presets">
			<span class="presets-label">Presets:</span>
			{#each spacingPresets as preset (preset.label)}
				<button
					type="button"
					class="preset-btn"
					class:active={gridSpacing === preset.value}
					onclick={() => (gridSpacing = preset.value)}
				>
					{preset.label}
				</button>
			{/each}
		</div>
	</CollapsibleSection>

	<CollapsibleSection title="Grid Display">
		<div class="checkbox-list">
			<Checkbox bind:checked={showGrid} label="Show Grid" />
			<Checkbox bind:checked={snapToGrid} label="Snap to Grid" />
			<Checkbox bind:checked={showCenterLine} label="Show Center Line" />
			<Checkbox bind:checked={showPlasterLine} label="Show Plaster Line" />
		</div>
	</CollapsibleSection>

	<CollapsibleSection title="Statistics">
		<div class="stats-grid">
			<div class="stat-item">
				<span class="stat-value">{stats.hangingPositions}</span>
				<span class="stat-label">Positions</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{stats.instruments}</span>
				<span class="stat-label">Instruments</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{stats.shapes}</span>
				<span class="stat-label">Shapes</span>
			</div>
		</div>
	</CollapsibleSection>
</div>

<style>
	.project-properties {
		display: flex;
		flex-direction: column;
	}

	.presets {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}

	.presets-label {
		font-size: 11px;
		color: var(--color-text-muted, #666);
	}

	.preset-btn {
		padding: 4px 8px;
		font-size: 11px;
		background: var(--color-bg-tertiary, #1e1e1e);
		border: 1px solid var(--color-border, #444);
		border-radius: 3px;
		color: var(--color-text-secondary, #999);
		cursor: pointer;
	}

	.preset-btn:hover {
		border-color: var(--color-text-secondary, #999);
		color: var(--color-text-primary, #fff);
	}

	.preset-btn.active {
		background: var(--color-accent, #4287f5);
		border-color: var(--color-accent, #4287f5);
		color: white;
	}

	.checkbox-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 12px 8px;
		background: var(--color-bg-tertiary, #1e1e1e);
		border-radius: 6px;
	}

	.stat-value {
		font-size: 20px;
		font-weight: 600;
		color: var(--color-text-primary, #fff);
	}

	.stat-label {
		font-size: 10px;
		color: var(--color-text-muted, #666);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
</style>
