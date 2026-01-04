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

	// Local state for fields not stored in project
	let venueName = $state<string | null>(null);

	// Unit options
	const unitOptions: Array<{ value: GridUnit; label: string }> = [
		{ value: 'feet', label: 'Feet' },
		{ value: 'meters', label: 'Meters' }
	];

	// Grid spacing preset options based on current unit
	const spacingPresets = $derived(
		GRID_SPACING_PRESETS.filter((p) => p.unit === grid.unit).map((p) => ({
			value: p.value,
			label: p.label
		}))
	);

	// Handler functions for direct updates
	function handleProjectNameChange(value: string | null) {
		if (value !== null) {
			project.setProjectInfo(value, project.projectId ?? undefined);
		}
	}

	function handleGridUnitChange(value: GridUnit | null) {
		if (value !== null) {
			grid.setUnit(value);
		}
	}

	function handleGridSpacingChange(value: number | null) {
		if (value !== null) {
			grid.setSpacing(value);
		}
	}

	function handleShowGridChange(checked: boolean) {
		if (checked !== grid.showGrid) {
			grid.toggleGrid();
		}
	}

	function handleSnapToGridChange(checked: boolean) {
		if (checked !== grid.snapToGrid) {
			grid.toggleSnap();
		}
	}

	function handleShowCenterLineChange(checked: boolean) {
		if (checked !== grid.showCenterLine) {
			grid.toggleCenterLine();
		}
	}

	function handleShowPlasterLineChange(checked: boolean) {
		if (checked !== grid.showPlasterLine) {
			grid.togglePlasterLine();
		}
	}

	function setSpacingPreset(value: number) {
		grid.setSpacing(value);
	}

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
			<TextInput
				value={project.projectName}
				onchange={handleProjectNameChange}
				placeholder="Project name"
			/>
		</FormField>

		<FormField label="Venue">
			<TextInput bind:value={venueName} placeholder="Venue name" />
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Scale & Units">
		<FormField label="Unit">
			<SelectDropdown value={grid.unit} onchange={handleGridUnitChange} options={unitOptions} />
		</FormField>

		<FormField label="Grid Spacing">
			<NumberInput
				value={grid.spacing}
				onchange={handleGridSpacingChange}
				min={0.1}
				max={10}
				step={0.5}
				unit={grid.unit === 'feet' ? 'ft' : 'm'}
			/>
		</FormField>

		<div class="presets">
			<span class="presets-label">Presets:</span>
			{#each spacingPresets as preset (preset.label)}
				<button
					type="button"
					class="preset-btn"
					class:active={grid.spacing === preset.value}
					onclick={() => setSpacingPreset(preset.value)}
				>
					{preset.label}
				</button>
			{/each}
		</div>
	</CollapsibleSection>

	<CollapsibleSection title="Grid Display">
		<div class="checkbox-list">
			<Checkbox checked={grid.showGrid} onchange={handleShowGridChange} label="Show Grid" />
			<Checkbox checked={grid.snapToGrid} onchange={handleSnapToGridChange} label="Snap to Grid" />
			<Checkbox
				checked={grid.showCenterLine}
				onchange={handleShowCenterLineChange}
				label="Show Center Line"
			/>
			<Checkbox
				checked={grid.showPlasterLine}
				onchange={handleShowPlasterLineChange}
				label="Show Plaster Line"
			/>
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
