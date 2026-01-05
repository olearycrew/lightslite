<script lang="ts">
	/**
	 * PropertiesPanel Component
	 *
	 * Right-hand panel with tabbed interface for:
	 * - Project: Project-level properties
	 * - Selection: Context-sensitive properties for selected objects
	 * - Layers: Layer management
	 *
	 * Auto-switches to Selection tab when objects are selected,
	 * and back to Project tab when selection is cleared.
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
	import LayersPanel from './LayersPanel.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import X from '@lucide/svelte/icons/x';

	// Track the active tab
	let activeTab = $state('project');

	// Track previous selection state to detect changes (using a plain variable, not state)
	let previousHasSelection = false;

	// Auto-switch tabs based on selection changes
	$effect(() => {
		const hasSelection = selection.hasSelection;

		// Selection was just made - switch to selection tab
		if (hasSelection && !previousHasSelection) {
			activeTab = 'selection';
		}
		// Selection was just cleared - switch to project tab
		else if (!hasSelection && previousHasSelection) {
			activeTab = 'project';
		}

		// Update previous state (plain variable, not reactive)
		previousHasSelection = hasSelection;
	});

	// Determine what to show in the selection tab based on selection
	const selectionContent = $derived.by(() => {
		// No selection - show nothing specific
		if (!selection.hasSelection) {
			return { type: 'none' as const };
		}

		// Multiple selection - show multi-select properties
		if (!selection.isSingleSelection) {
			return { type: 'multi' as const };
		}

		// Single selection - get the selected object
		const selectedId = selection.selectedIds[0];
		const obj = project.getObject(selectedId);

		if (!obj) {
			return { type: 'none' as const };
		}

		switch (obj.objectType) {
			case 'instrument':
				return { type: 'instrument' as const, object: obj as InstrumentObject };
			case 'hanging-position':
				return { type: 'position' as const, object: obj as HangingPositionObject };
			case 'shape':
				return { type: 'shape' as const, object: obj as ShapeObject };
			default:
				return { type: 'none' as const };
		}
	});

	// Selection tab title based on content
	const selectionTabTitle = $derived(() => {
		if (!selection.hasSelection) {
			return 'Selection';
		}
		if (!selection.isSingleSelection) {
			return `Selection (${selection.selectionCount})`;
		}
		switch (selectionContent.type) {
			case 'instrument':
				return 'Instrument';
			case 'position':
				return 'Position';
			case 'shape':
				return 'Shape';
			default:
				return 'Selection';
		}
	});
</script>

<aside class="flex flex-col w-[280px] h-full bg-card border-l border-border overflow-hidden">
	<Tabs.Root bind:value={activeTab} class="flex flex-col h-full">
		<!-- Tab list header -->
		<header class="px-3 py-3 bg-card">
			<Tabs.List class="w-full">
				<Tabs.Trigger value="project">Project</Tabs.Trigger>
				<Tabs.Trigger value="selection" class="relative">
					{selectionTabTitle()}
					{#if selection.hasSelection}
						<span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full"></span>
					{/if}
				</Tabs.Trigger>
				<Tabs.Trigger value="layers">Layers</Tabs.Trigger>
			</Tabs.List>
		</header>

		<!-- Tab content area -->
		<div class="flex-1 overflow-hidden">
			<!-- Project Tab -->
			<Tabs.Content
				value="project"
				class="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted hover:scrollbar-thumb-muted-foreground"
			>
				<ProjectProperties />
			</Tabs.Content>

			<!-- Selection Tab -->
			<Tabs.Content
				value="selection"
				class="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted hover:scrollbar-thumb-muted-foreground"
			>
				{#if selection.hasSelection}
					<!-- Clear selection button -->
					<div class="flex justify-end p-2 border-b border-border">
						<Button
							variant="ghost"
							size="sm"
							onclick={() => selection.clearSelection()}
							title="Clear selection (Esc)"
						>
							<X class="h-4 w-4 mr-1" />
							Clear
						</Button>
					</div>

					{#if selectionContent.type === 'instrument' && selectionContent.object}
						<InstrumentProperties instrument={selectionContent.object} />
					{:else if selectionContent.type === 'position' && selectionContent.object}
						<PositionProperties position={selectionContent.object} />
					{:else if selectionContent.type === 'shape' && selectionContent.object}
						<ShapeProperties shape={selectionContent.object} />
					{:else if selectionContent.type === 'multi'}
						<MultiSelectProperties />
					{/if}
				{:else}
					<div class="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
						<p class="text-sm text-center">No selection</p>
						<p class="text-xs text-center mt-2">Click on objects in the canvas to select them</p>
					</div>
				{/if}
			</Tabs.Content>

			<!-- Layers Tab -->
			<Tabs.Content
				value="layers"
				class="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted hover:scrollbar-thumb-muted-foreground p-2"
			>
				<LayersPanel />
			</Tabs.Content>
		</div>
	</Tabs.Root>
</aside>
