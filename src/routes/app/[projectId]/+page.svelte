<script lang="ts">
	/**
	 * Project Editor Page
	 *
	 * The main CAD workspace for editing lighting plots.
	 * Placeholder UI - will contain the Pixi.js canvas and toolbar.
	 */
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Placeholder - will be replaced with actual editor state
	let selectedTool = $state<'select' | 'pan' | 'line' | 'rect'>('select');

	const tools = [
		{ id: 'select', icon: 'cursor', label: 'Select' },
		{ id: 'pan', icon: 'hand', label: 'Pan' },
		{ id: 'line', icon: 'line', label: 'Line' },
		{ id: 'rect', icon: 'square', label: 'Rectangle' }
	] as const;
</script>

<div class="flex h-[calc(100vh-3.5rem)] flex-col">
	<!-- Toolbar -->
	<div class="flex h-12 items-center gap-2 border-b border-border bg-bg-secondary px-4">
		<!-- Project Name -->
		<div class="flex items-center gap-2">
			<h2 class="font-medium text-text-primary">{data.project?.name || 'Untitled Project'}</h2>
		</div>

		<div class="mx-4 h-6 w-px bg-border"></div>

		<!-- Tool Buttons -->
		<div class="flex gap-1">
			{#each tools as tool (tool.id)}
				<button
					onclick={() => (selectedTool = tool.id)}
					class="toolbar-btn"
					class:bg-accent={selectedTool === tool.id}
					class:text-text-primary={selectedTool === tool.id}
					title={tool.label}
				>
					{#if tool.icon === 'cursor'}
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
					{:else if tool.icon === 'hand'}
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
							/>
						</svg>
					{:else if tool.icon === 'line'}
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 20L20 4"
							/>
						</svg>
					{:else if tool.icon === 'square'}
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<rect x="4" y="4" width="16" height="16" rx="1" stroke-width="2" />
						</svg>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Spacer -->
		<div class="flex-1"></div>

		<!-- Zoom Controls -->
		<div class="flex items-center gap-2 text-sm text-text-secondary">
			<button class="toolbar-btn" aria-label="Zoom out">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
				</svg>
			</button>
			<span class="w-12 text-center">100%</span>
			<button class="toolbar-btn" aria-label="Zoom in">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
			</button>
		</div>
	</div>

	<!-- Canvas Area -->
	<div class="relative flex-1 overflow-hidden bg-bg-primary">
		<!-- Grid Background - Placeholder -->
		<div
			class="absolute inset-0"
			style="background-image: radial-gradient(circle, var(--color-border) 1px, transparent 1px); background-size: 20px 20px;"
		></div>

		<!-- Canvas will be mounted here -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="panel p-8 text-center">
				<svg
					class="mx-auto mb-4 h-16 w-16 text-text-muted"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
				<h3 class="mb-2 text-lg font-medium text-text-primary">Canvas Placeholder</h3>
				<p class="text-sm text-text-secondary">The Pixi.js canvas will be rendered here.</p>
				<p class="mt-2 text-xs text-text-muted">Select a tool from the toolbar to begin editing.</p>
			</div>
		</div>
	</div>

	<!-- Status Bar -->
	<div
		class="flex h-6 items-center justify-between border-t border-border bg-bg-secondary px-4 text-xs text-text-muted"
	>
		<div class="flex items-center gap-4">
			<span>Tool: {selectedTool}</span>
			<span>|</span>
			<span>Grid: 10px</span>
		</div>
		<div class="flex items-center gap-4">
			<span>Cursor: 0, 0</span>
			<span>|</span>
			<span>Objects: 0</span>
		</div>
	</div>
</div>
