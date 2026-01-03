<script lang="ts">
	/**
	 * Project Editor Page
	 *
	 * The main CAD workspace for editing lighting plots.
	 * Layout: Tool Palette (left) | Canvas (center) | Properties Panel (right)
	 */
	import type { PageData } from './$types';
	import { CanvasContainer } from '$lib/components/canvas';
	import { ToolPalette, PropertiesPanel } from '$lib/components/ui';
	import { viewport, selection, project, tool } from '$lib/stores';
	import { grid } from '$lib/stores/grid.svelte';

	let { data }: { data: PageData } = $props();

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
			viewport.fitToContent({ x: 0, y: 0, width: 200, height: 100 }, rect.width, rect.height);
		}
	}

	/**
	 * Handle reset view
	 */
	function handleResetView() {
		viewport.resetView();
	}

	// Total object count for status bar
	const totalObjects = $derived(
		project.hangingPositions.length +
			project.instruments.length +
			project.shapes.length +
			project.annotations.length
	);

	// Current tool name for status bar
	const currentToolName = $derived(tool.TOOL_NAMES[tool.activeTool]);
</script>

<div class="editor-layout">
	<!-- Left Sidebar: Tool Palette -->
	<aside class="tool-sidebar">
		<ToolPalette />
	</aside>

	<!-- Main Content Area -->
	<div class="main-area">
		<!-- Toolbar -->
		<div class="toolbar">
			<!-- Project Name -->
			<div class="toolbar-section">
				<h2 class="project-name">{data.project?.name || 'Untitled Project'}</h2>
			</div>

			<div class="toolbar-divider"></div>

			<!-- Spacer -->
			<div class="flex-1"></div>

			<!-- View Controls -->
			<div class="toolbar-section">
				<button onclick={handleFitContent} class="toolbar-btn" title="Fit to content (Ctrl+0)">
					<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
						/>
					</svg>
				</button>
				<button onclick={handleResetView} class="toolbar-btn" title="Reset view (100%)">
					<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
						/>
					</svg>
				</button>
			</div>

			<div class="toolbar-divider"></div>

			<!-- Zoom Controls -->
			<div class="toolbar-section zoom-controls">
				<button class="toolbar-btn" aria-label="Zoom out" onclick={handleZoomOut}>
					<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
					</svg>
				</button>
				<span class="zoom-percent">{viewport.zoomPercent}%</span>
				<button class="toolbar-btn" aria-label="Zoom in" onclick={handleZoomIn}>
					<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
		<div class="canvas-area" onmousemove={handleCanvasMouseMove}>
			<CanvasContainer />
		</div>

		<!-- Status Bar -->
		<div class="status-bar">
			<div class="status-left">
				<span class="status-item">Tool: {currentToolName}</span>
				<span class="status-separator">|</span>
				<span class="status-item">
					Grid: {grid.spacing}{grid.unit === 'feet' ? "'" : 'm'}
				</span>
				{#if selection.hasSelection}
					<span class="status-separator">|</span>
					<span class="status-item status-highlight">
						{selection.selectionCount} selected
					</span>
				{/if}
			</div>
			<div class="status-right">
				<span class="status-item">Cursor: {mouseX}, {mouseY}</span>
				<span class="status-separator">|</span>
				<span class="status-item">Zoom: {viewport.zoomPercent}%</span>
				<span class="status-separator">|</span>
				<span class="status-item">Objects: {totalObjects}</span>
			</div>
		</div>
	</div>

	<!-- Right Sidebar: Properties Panel -->
	<PropertiesPanel />
</div>

<style>
	.editor-layout {
		display: flex;
		height: calc(100vh - 3.5rem);
		overflow: hidden;
	}

	.tool-sidebar {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 12px 8px;
		background: var(--color-bg-primary, #1e1e1e);
		border-right: 1px solid var(--color-border, #444);
	}

	.main-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 48px;
		padding: 0 16px;
		background: var(--color-bg-secondary, #2d2d2d);
		border-bottom: 1px solid var(--color-border, #444);
	}

	.toolbar-section {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.toolbar-divider {
		width: 1px;
		height: 24px;
		background: var(--color-border, #444);
		margin: 0 8px;
	}

	.project-name {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-primary, #fff);
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		background: none;
		border: none;
		border-radius: 4px;
		color: var(--color-text-secondary, #999);
		cursor: pointer;
	}

	.toolbar-btn:hover {
		background: var(--color-bg-hover, rgba(255, 255, 255, 0.1));
		color: var(--color-text-primary, #fff);
	}

	.icon {
		width: 16px;
		height: 16px;
	}

	.zoom-controls {
		gap: 8px;
	}

	.zoom-percent {
		width: 48px;
		text-align: center;
		font-size: 12px;
		color: var(--color-text-secondary, #999);
	}

	.canvas-area {
		flex: 1;
		position: relative;
		overflow: hidden;
		background: var(--color-bg-primary, #1e1e1e);
	}

	.status-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 24px;
		padding: 0 16px;
		background: var(--color-bg-secondary, #2d2d2d);
		border-top: 1px solid var(--color-border, #444);
		font-size: 11px;
		color: var(--color-text-muted, #666);
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-separator {
		color: var(--color-border, #444);
	}

	.status-highlight {
		color: var(--color-accent, #4287f5);
	}

	.flex-1 {
		flex: 1;
	}
</style>
