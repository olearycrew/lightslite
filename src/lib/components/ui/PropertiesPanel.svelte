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
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import X from '@lucide/svelte/icons/x';

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

<aside class="flex flex-col w-[280px] h-full bg-card border-l border-border overflow-hidden">
	<header class="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
		<h2 class="text-sm font-semibold text-foreground">{panelTitle()}</h2>
		{#if selection.hasSelection}
			<Button
				variant="ghost"
				size="icon-sm"
				onclick={() => selection.clearSelection()}
				title="Clear selection (Esc)"
			>
				<X class="h-4 w-4" />
			</Button>
		{/if}
	</header>

	<div
		class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted hover:scrollbar-thumb-muted-foreground"
	>
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
