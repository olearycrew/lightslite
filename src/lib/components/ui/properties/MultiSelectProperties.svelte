<script lang="ts">
	/**
	 * MultiSelectProperties Component
	 *
	 * Properties panel for editing multiple selected items.
	 * Shows common properties and batch operations.
	 */
	import { project } from '$lib/stores/project.svelte';
	import { selection } from '$lib/stores/selection.svelte';
	import { FormField, TextInput, ColorInput, CollapsibleSection } from '../forms';

	// Get selected objects with their types
	const selectedObjects = $derived(
		selection.selectedIds.map((id) => project.getObject(id)).filter((obj) => obj !== null)
	);

	// Count by type
	const countsByType = $derived(() => {
		const counts: Record<string, number> = {};
		for (const obj of selectedObjects) {
			if (obj) {
				const type = obj.objectType;
				counts[type] = (counts[type] || 0) + 1;
			}
		}
		return counts;
	});

	// Check if all selected are instruments
	const allInstruments = $derived(
		selectedObjects.length > 0 && selectedObjects.every((obj) => obj?.objectType === 'instrument')
	);

	// Check if all selected are shapes
	const allShapes = $derived(
		selectedObjects.length > 0 && selectedObjects.every((obj) => obj?.objectType === 'shape')
	);

	// Common color for instruments (or null if mixed)
	const commonColor = $derived(() => {
		if (!allInstruments) return null;
		const colors = selectedObjects.map((obj) =>
			obj?.objectType === 'instrument' ? (obj as any).color : null
		);
		const first = colors[0];
		return colors.every((c) => c === first) ? first : null;
	});

	// Common stroke for shapes (or null if mixed)
	const commonStroke = $derived(() => {
		if (!allShapes) return null;
		const strokes = selectedObjects.map((obj) =>
			obj?.objectType === 'shape' ? (obj as any).stroke : null
		);
		const first = strokes[0];
		return strokes.every((s) => s === first) ? first : null;
	});

	// Local state
	let batchColor = $state<string | null>(null);
	let batchStroke = $state<string | null>(null);

	/**
	 * Apply color to all selected instruments
	 */
	function applyColorToAll() {
		if (!batchColor || !allInstruments) return;
		for (const id of selection.selectedIds) {
			project.updateInstrument(id, { color: batchColor });
		}
	}

	/**
	 * Apply stroke to all selected shapes
	 */
	function applyStrokeToAll() {
		if (!batchStroke || !allShapes) return;
		for (const id of selection.selectedIds) {
			project.updateShape(id, { stroke: batchStroke });
		}
	}

	/**
	 * Delete all selected objects
	 */
	function deleteAll() {
		project.deleteObjects(selection.selectedIds);
		selection.clearSelection();
	}

	/**
	 * Duplicate all selected objects
	 */
	function duplicateAll() {
		// For now, just show the feature is planned
		// Implementation would need to copy each object with offset
		console.log('Duplicate all - not yet implemented');
	}

	/**
	 * Clear selection
	 */
	function clearSelection() {
		selection.clearSelection();
	}

	// Format type name for display
	function formatTypeName(type: string): string {
		const names: Record<string, string> = {
			instrument: 'Instrument',
			'hanging-position': 'Position',
			shape: 'Shape',
			'set-piece': 'Set Piece',
			annotation: 'Annotation'
		};
		return names[type] || type;
	}
</script>

<div class="multi-select-properties">
	<CollapsibleSection title="Selection ({selection.selectionCount})">
		<div class="selection-summary">
			{#each Object.entries(countsByType()) as [type, count] (type)}
				<div class="type-count">
					<span class="count">{count}</span>
					<span class="type">{formatTypeName(type)}{count > 1 ? 's' : ''}</span>
				</div>
			{/each}
		</div>

		<button type="button" class="clear-btn" onclick={clearSelection}>Clear Selection</button>
	</CollapsibleSection>

	{#if allInstruments}
		<CollapsibleSection title="Common Properties">
			<FormField label="Color" layout="vertical">
				<div class="batch-input">
					<ColorInput bind:value={batchColor} placeholder="Set color for all" />
					<button type="button" class="apply-btn" onclick={applyColorToAll} disabled={!batchColor}>
						Apply
					</button>
				</div>
				{#if commonColor() !== null}
					<span class="current-value">Current: {commonColor() || 'None'}</span>
				{:else}
					<span class="mixed-value">Mixed values</span>
				{/if}
			</FormField>
		</CollapsibleSection>
	{/if}

	{#if allShapes}
		<CollapsibleSection title="Common Properties">
			<FormField label="Stroke" layout="vertical">
				<div class="batch-input">
					<ColorInput
						bind:value={batchStroke}
						placeholder="Set stroke for all"
						showPresets={false}
					/>
					<button
						type="button"
						class="apply-btn"
						onclick={applyStrokeToAll}
						disabled={!batchStroke}
					>
						Apply
					</button>
				</div>
				{#if commonStroke() !== null}
					<span class="current-value">Current: {commonStroke() || 'None'}</span>
				{:else}
					<span class="mixed-value">Mixed values</span>
				{/if}
			</FormField>
		</CollapsibleSection>
	{/if}

	<CollapsibleSection title="Batch Operations">
		<div class="batch-buttons">
			<button type="button" class="batch-btn" onclick={duplicateAll} disabled>
				<span class="btn-icon">⧉</span>
				Duplicate All
			</button>
			<button type="button" class="batch-btn delete" onclick={deleteAll}>
				<span class="btn-icon">🗑</span>
				Delete All
			</button>
		</div>
	</CollapsibleSection>
</div>

<style>
	.multi-select-properties {
		display: flex;
		flex-direction: column;
	}

	.selection-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 12px;
	}

	.type-count {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		background: var(--color-bg-tertiary, #1e1e1e);
		border-radius: 4px;
	}

	.count {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-accent, #4287f5);
	}

	.type {
		font-size: 12px;
		color: var(--color-text-secondary, #999);
	}

	.clear-btn {
		width: 100%;
		padding: 8px 12px;
		background: var(--color-bg-tertiary, #1e1e1e);
		border: 1px solid var(--color-border, #444);
		border-radius: 4px;
		color: var(--color-text-secondary, #999);
		font-size: 12px;
		cursor: pointer;
	}

	.clear-btn:hover {
		border-color: var(--color-text-secondary, #999);
		color: var(--color-text-primary, #fff);
	}

	.batch-input {
		display: flex;
		gap: 8px;
		align-items: flex-start;
	}

	.batch-input > :first-child {
		flex: 1;
	}

	.apply-btn {
		padding: 6px 12px;
		background: var(--color-accent, #4287f5);
		border: none;
		border-radius: 4px;
		color: white;
		font-size: 12px;
		cursor: pointer;
		white-space: nowrap;
	}

	.apply-btn:hover {
		background: var(--color-accent-hover, #5a9df5);
	}

	.apply-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.current-value,
	.mixed-value {
		font-size: 11px;
		margin-top: 4px;
	}

	.current-value {
		color: var(--color-text-muted, #666);
	}

	.mixed-value {
		color: var(--color-warning, #ffa500);
		font-style: italic;
	}

	.batch-buttons {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.batch-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 10px 12px;
		background: var(--color-bg-tertiary, #1e1e1e);
		border: 1px solid var(--color-border, #444);
		border-radius: 4px;
		color: var(--color-text-secondary, #999);
		font-size: 12px;
		cursor: pointer;
	}

	.batch-btn:hover:not(:disabled) {
		border-color: var(--color-text-secondary, #999);
		color: var(--color-text-primary, #fff);
	}

	.batch-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.batch-btn.delete {
		background: rgba(255, 100, 100, 0.1);
		border-color: rgba(255, 100, 100, 0.3);
		color: #ff6464;
	}

	.batch-btn.delete:hover {
		background: rgba(255, 100, 100, 0.2);
		border-color: rgba(255, 100, 100, 0.5);
	}

	.btn-icon {
		font-size: 14px;
	}
</style>
