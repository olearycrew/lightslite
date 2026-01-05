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
	import LayersPanel from '../LayersPanel.svelte';

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

	// Derive stage bounds presence
	const hasStageBounds = $derived(project.venue.stageBounds !== null);

	// Handler functions for direct updates
	function handleProjectNameChange(value: string | null) {
		if (value !== null) {
			project.setProjectInfo(value, project.projectId ?? undefined);
		}
	}

	function handleVenueNameChange(value: string | null) {
		if (value !== null) {
			project.updateVenue({ name: value });
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

	function handleShowStageBoundsChange(checked: boolean) {
		if (checked !== project.venue.showStageBounds) {
			project.toggleStageBounds();
		}
	}

	function setSpacingPreset(value: number) {
		grid.setSpacing(value);
	}

	// Stage bounds handlers
	function handleStageBoundsWidthChange(value: number | null) {
		if (value !== null && value > 0) {
			const bounds = project.venue.stageBounds;
			if (bounds) {
				// Convert feet to pixels
				const widthPx = value * grid.pixelsPerUnit;
				// Keep centered on centerline
				project.setStageBounds({
					...bounds,
					x: project.venue.centerLine - widthPx / 2,
					width: widthPx
				});
			} else {
				// Create new bounds centered on origin
				const widthPx = value * grid.pixelsPerUnit;
				const heightPx = 20 * grid.pixelsPerUnit; // Default 20 feet depth
				project.setStageBounds({
					x: project.venue.centerLine - widthPx / 2,
					y: project.venue.plasterLine,
					width: widthPx,
					height: heightPx
				});
			}
		}
	}

	function handleStageBoundsDepthChange(value: number | null) {
		if (value !== null && value > 0) {
			const bounds = project.venue.stageBounds;
			if (bounds) {
				// Convert feet to pixels
				const heightPx = value * grid.pixelsPerUnit;
				project.setStageBounds({
					...bounds,
					height: heightPx
				});
			} else {
				// Create new bounds centered on origin
				const widthPx = 40 * grid.pixelsPerUnit; // Default 40 feet width
				const heightPx = value * grid.pixelsPerUnit;
				project.setStageBounds({
					x: project.venue.centerLine - widthPx / 2,
					y: project.venue.plasterLine,
					width: widthPx,
					height: heightPx
				});
			}
		}
	}

	function handleProsceniumWidthChange(value: number | null) {
		project.setProscenium(value, project.venue.prosceniumHeight);
	}

	function handleProsceniumHeightChange(value: number | null) {
		project.setProscenium(project.venue.prosceniumWidth, value);
	}

	function clearStageBounds() {
		project.setStageBounds(null);
	}

	// Derived stage dimensions in feet (converted from pixels)
	const stageBoundsWidthFeet = $derived(
		project.venue.stageBounds ? project.venue.stageBounds.width / grid.pixelsPerUnit : null
	);

	const stageBoundsDepthFeet = $derived(
		project.venue.stageBounds ? project.venue.stageBounds.height / grid.pixelsPerUnit : null
	);

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
			<TextInput
				value={project.venue.name}
				onchange={handleVenueNameChange}
				placeholder="Venue name"
			/>
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Stage Configuration">
		<div class="stage-bounds-row">
			<FormField label="Stage Width" layout="vertical">
				<NumberInput
					value={stageBoundsWidthFeet}
					onchange={handleStageBoundsWidthChange}
					min={1}
					max={200}
					step={1}
					unit={grid.unit === 'feet' ? 'ft' : 'm'}
					placeholder="Width"
				/>
			</FormField>

			<FormField label="Stage Depth" layout="vertical">
				<NumberInput
					value={stageBoundsDepthFeet}
					onchange={handleStageBoundsDepthChange}
					min={1}
					max={200}
					step={1}
					unit={grid.unit === 'feet' ? 'ft' : 'm'}
					placeholder="Depth"
				/>
			</FormField>
		</div>

		{#if hasStageBounds}
			<button type="button" class="clear-btn" onclick={clearStageBounds}>
				Clear Stage Bounds
			</button>
		{/if}

		<div class="divider"></div>

		<div class="proscenium-row">
			<FormField label="Proscenium Width" layout="vertical">
				<NumberInput
					value={project.venue.prosceniumWidth}
					onchange={handleProsceniumWidthChange}
					min={1}
					max={100}
					step={1}
					unit={grid.unit === 'feet' ? 'ft' : 'm'}
					placeholder="None"
				/>
			</FormField>

			<FormField label="Proscenium Height" layout="vertical">
				<NumberInput
					value={project.venue.prosceniumHeight}
					onchange={handleProsceniumHeightChange}
					min={1}
					max={60}
					step={1}
					unit={grid.unit === 'feet' ? 'ft' : 'm'}
					placeholder="None"
				/>
			</FormField>
		</div>

		<div class="checkbox-list" style="margin-top: 12px;">
			<Checkbox
				checked={project.venue.showStageBounds}
				onchange={handleShowStageBoundsChange}
				label="Show Stage Bounds"
			/>
		</div>
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

	<!-- Layers Section -->
	<LayersPanel />
</div>

<style>
	.project-properties {
		display: flex;
		flex-direction: column;
	}

	.stage-bounds-row,
	.proscenium-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.divider {
		height: 1px;
		background: var(--color-border, #444);
		margin: 12px 0;
	}

	.clear-btn {
		width: 100%;
		padding: 6px 12px;
		margin-top: 8px;
		font-size: 12px;
		background: var(--color-bg-tertiary, #1e1e1e);
		border: 1px solid var(--color-border, #444);
		border-radius: 4px;
		color: var(--color-text-secondary, #999);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.clear-btn:hover {
		border-color: var(--color-red, #f38ba8);
		color: var(--color-red, #f38ba8);
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
