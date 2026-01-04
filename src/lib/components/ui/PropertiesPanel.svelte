<script lang="ts">
	/**
	 * PropertiesPanel Component
	 *
	 * Context-sensitive properties panel for the editor.
	 * Shows different content based on what is selected:
	 * - No selection → Project properties
	 * - Single instrument → Instrument properties
	 * - Single hanging position → Position properties
	 * - Single shape → Shape properties
	 * - Multiple items → Multi-select properties
	 */
	import { selection } from '$lib/stores/selection.svelte';
	import {
		project,
		type InstrumentObject,
		type HangingPositionObject,
		type ShapeObject
	} from '$lib/stores/project.svelte';
	import {
		InstrumentProperties,
		PositionProperties,
		ShapeProperties,
		ProjectProperties,
		MultiSelectProperties
	} from './properties';

	// Determine what to show based on selection
	const panelContent = $derived.by(() => {
		// No selection - show project properties
		if (!selection.hasSelection) {
			return { type: 'project' as const };
		}

		// Multiple selection - show multi-select properties
		if (!selection.isSingleSelection) {
			return { type: 'multi' as const };
		}

		// Single selection - get the selected object
		const selectedId = selection.selectedIds[0];
		// selectionType available for future use
		const obj = project.getObject(selectedId);

		if (!obj) {
			return { type: 'project' as const };
		}

		switch (obj.objectType) {
			case 'instrument':
				return { type: 'instrument' as const, object: obj as InstrumentObject };
			case 'hanging-position':
				return { type: 'position' as const, object: obj as HangingPositionObject };
			case 'shape':
				return { type: 'shape' as const, object: obj as ShapeObject };
			default:
				return { type: 'project' as const };
		}
	});

	// Panel title based on content
	const panelTitle = $derived(() => {
		switch (panelContent.type) {
			case 'instrument':
				return 'Instrument';
			case 'position':
				return 'Hanging Position';
			case 'shape':
				return 'Shape';
			case 'multi':
				return `Selection (${selection.selectionCount})`;
			default:
				return 'Project';
		}
	});
</script>

<aside class="properties-panel">
	<header class="panel-header">
		<h2 class="panel-title">{panelTitle()}</h2>
		{#if selection.hasSelection}
			<button
				type="button"
				class="deselect-btn"
				onclick={() => selection.clearSelection()}
				title="Clear selection (Esc)"
			>
				✕
			</button>
		{/if}
	</header>

	<div class="panel-content">
		{#if panelContent.type === 'instrument' && panelContent.object}
			<InstrumentProperties instrument={panelContent.object} />
		{:else if panelContent.type === 'position' && panelContent.object}
			<PositionProperties position={panelContent.object} />
		{:else if panelContent.type === 'shape' && panelContent.object}
			<ShapeProperties shape={panelContent.object} />
		{:else if panelContent.type === 'multi'}
			<MultiSelectProperties />
		{:else}
			<ProjectProperties />
		{/if}
	</div>
</aside>

<style>
	.properties-panel {
		display: flex;
		flex-direction: column;
		width: 280px;
		height: 100%;
		background: var(--color-mantle, #181825);
		border-left: 1px solid var(--color-surface1, #45475a);
		overflow: hidden;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid var(--color-surface1, #45475a);
		background: var(--color-mantle, #181825);
	}

	.panel-title {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text, #cdd6f4);
	}

	.deselect-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		background: none;
		border: none;
		border-radius: 4px;
		color: var(--color-overlay0, #6c7086);
		font-size: 12px;
		cursor: pointer;
	}

	.deselect-btn:hover {
		background: var(--color-surface0, #313244);
		color: var(--color-subtext1, #bac2de);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
	}

	/* Custom scrollbar */
	.panel-content::-webkit-scrollbar {
		width: 6px;
	}

	.panel-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.panel-content::-webkit-scrollbar-thumb {
		background: var(--color-surface1, #45475a);
		border-radius: 3px;
	}

	.panel-content::-webkit-scrollbar-thumb:hover {
		background: var(--color-surface2, #585b70);
	}
</style>
