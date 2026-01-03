<script lang="ts">
	/**
	 * Project Editor Page
	 *
	 * The main CAD workspace for editing lighting plots.
	 * Contains the SVG canvas viewport with pan/zoom functionality.
	 */
	import type { PageData } from './$types';
	import { CanvasContainer } from '$lib/components/canvas';
	import { viewport } from '$lib/stores';

	let { data }: { data: PageData } = $props();

	// Placeholder - will be replaced with actual editor state
	let selectedTool = $state<'select' | 'pan' | 'line' | 'rect'>('select');

	const tools = [
		{ id: 'select', icon: 'cursor', label: 'Select' },
		{ id: 'pan', icon: 'hand', label: 'Pan' },
		{ id: 'line', icon: 'line', label: 'Line' },
		{ id: 'rect', icon: 'square', label: 'Rectangle' }
	] as const;

	// Mouse position tracking for status bar
	let mouseX = $state(0);
	let mouseY = $state(0);

	function handleCanvasMouseMove(event: MouseEvent) {
		// Convert to world coordinates for display
		const world = viewport.screenToWorld(event.offsetX, event.offsetY);
		mouseX = Math.round(world.x);
		mouseY = Math.round(world.y);
	}

	/**
	 * Handle zoom in button click
	 */
	function handleZoomIn() {
		// Get viewport dimensions (approximate center)
		const container = document.querySelector('.canvas-area');
		if (container) {
			const rect = container.getBoundingClientRect();
			viewport.zoomBy(1.2, rect.width / 2, rect.height / 2);
		}
	}

	/**
	 * Handle zoom out button click
	 */
	function handleZoomOut() {
		const container = document.querySelector('.canvas-area');
		if (container) {
			const rect = container.getBoundingClientRect();
			viewport.zoomBy(0.8, rect.width / 2, rect.height / 2);
		}
	}

	/**
	 * Handle fit to content
	 */
	function handleFitContent() {
		const container = document.querySelector('.canvas-area');
		if (container) {
			const rect = container.getBoundingClientRect();
			// Fit to test rectangle bounds (placeholder)
			viewport.fitToContent({ x: 0, y: 0, width: 200, height: 100 }, rect.width, rect.height);
		}
	}

	/**
	 * Handle reset view
	 */
	function handleResetView() {
		viewport.resetView();
	}
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

		<!-- View Controls -->
		<div class="flex items-center gap-1">
			<button onclick={handleFitContent} class="toolbar-btn" title="Fit to content (Ctrl+0)">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
					/>
				</svg>
			</button>
			<button onclick={handleResetView} class="toolbar-btn" title="Reset view (100%)">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
					/>
				</svg>
			</button>
		</div>

		<div class="mx-2 h-6 w-px bg-border"></div>

		<!-- Zoom Controls -->
		<div class="flex items-center gap-2 text-sm text-text-secondary">
			<button class="toolbar-btn" aria-label="Zoom out" onclick={handleZoomOut}>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
				</svg>
			</button>
			<span class="w-12 text-center">{viewport.zoomPercent}%</span>
			<button class="toolbar-btn" aria-label="Zoom in" onclick={handleZoomIn}>
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
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="canvas-area relative flex-1 overflow-hidden" onmousemove={handleCanvasMouseMove}>
		<CanvasContainer />
	</div>

	<!-- Status Bar -->
	<div
		class="flex h-6 items-center justify-between border-t border-border bg-bg-secondary px-4 text-xs text-text-muted"
	>
		<div class="flex items-center gap-4">
			<span>Tool: {selectedTool}</span>
			<span>|</span>
			<span>Grid: 20px</span>
		</div>
		<div class="flex items-center gap-4">
			<span>Cursor: {mouseX}, {mouseY}</span>
			<span>|</span>
			<span>Zoom: {viewport.zoomPercent}%</span>
			<span>|</span>
			<span>Objects: 0</span>
		</div>
	</div>
</div>
