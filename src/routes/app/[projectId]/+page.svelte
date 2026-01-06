<script lang="ts">
	/**
	 * Project Editor Page
	 *
	 * The main CAD workspace for editing lighting plots.
	 * Layout: Tool Palette (left) | Canvas (center) | Properties Panel (right)
	 *
	 * Integrates with SyncManager for:
	 * - Loading project data from IndexedDB/server into store
	 * - Automatic syncing of changes to IndexedDB and server
	 * - Offline support and conflict resolution
	 * - Crash recovery with RecoveryDialog
	 */
	import type { PageData } from './$types';
	import { CanvasContainer } from '$lib/components/canvas';
	import {
		ToolPalette,
		PropertiesPanel,
		RecoveryDialog,
		OfflineIndicator
	} from '$lib/components/ui';
	import KeyboardShortcuts from '$lib/components/KeyboardShortcuts.svelte';
	import { viewport, selection, project, tool } from '$lib/stores';
	import { grid } from '$lib/stores/grid.svelte';
	import { onMount, onDestroy } from 'svelte';
	// Only import types at top level - actual getSyncManager must be called in onMount
	import type { SyncManager, RecoveryInfo } from '$lib/sync';

	let { data }: { data: PageData } = $props();

	// SyncManager reference - initialized in onMount to avoid SSR issues
	let syncManager: SyncManager | null = null;

	// Track initialization state
	let isInitialized = $state(false);
	// _initError is reserved for future error handling
	let __initError = $state<string | null>(null);

	// Recovery dialog state
	let showRecoveryDialog = $state(false);
	let recoveryInfo = $state<RecoveryInfo | null>(null);
	let isRecovering = $state(false);

	// Save viewport timeout for debouncing
	let viewportSaveTimeout: ReturnType<typeof setTimeout> | null = null;

	// Restore viewport from project metadata on initialization
	$effect(() => {
		if (data.project?.metadata && isInitialized) {
			const metadata = data.project.metadata as Record<string, unknown>;
			const viewportSettings = metadata?.viewport as
				| { panX?: number; panY?: number; zoom?: number }
				| undefined;
			if (viewportSettings) {
				viewport.setState(viewportSettings);
				console.log('[EditorPage] Restored viewport from metadata:', viewportSettings);
			}
		}
	});

	// Effect to save viewport when it changes (debounced)
	$effect(() => {
		// Track viewport state changes to trigger effect
		const panX = viewport.panX;
		const panY = viewport.panY;
		const zoom = viewport.zoom;

		// Use the values to prevent dead code elimination
		void panX;
		void panY;
		void zoom;

		if (!isInitialized || !syncManager || !data.project?.id) return;

		// Debounce the save to avoid excessive API calls
		if (viewportSaveTimeout) {
			clearTimeout(viewportSaveTimeout);
		}

		viewportSaveTimeout = setTimeout(async () => {
			const viewportState = viewport.getState();
			try {
				// Get current metadata and update viewport
				const currentMetadata = (data.project?.metadata as Record<string, unknown>) || {};
				const newMetadata = {
					...currentMetadata,
					viewport: viewportState
				};

				// Update project via API (this will be debounced by SyncManager)
				await fetch(`/api/projects/${data.project.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ metadata: newMetadata })
				});
				console.log('[EditorPage] Saved viewport to metadata:', viewportState);
			} catch (error) {
				console.error('[EditorPage] Failed to save viewport:', error);
			}
		}, 1000); // 1 second debounce

		return () => {
			if (viewportSaveTimeout) {
				clearTimeout(viewportSaveTimeout);
			}
		};
	});

	// Initialize SyncManager and check for recovery data on mount (client-side only)
	onMount(async () => {
		console.log('[EditorPage] onMount - initializing SyncManager', {
			projectId: data.project?.id,
			projectName: data.project?.name,
			projectLayers: data.project?.layers
		});

		if (!data.project?.id) {
			__initError = 'No project ID provided';
			return;
		}

		try {
			// Dynamically import SyncManager to avoid SSR issues with $state runes
			const { getSyncManager } = await import('$lib/sync');
			syncManager = getSyncManager();

			// Check for recovery data BEFORE initializing
			// This compares local IndexedDB cache with server data
			const serverVersion = data.project.version ?? 0;
			const serverUpdatedAt = data.project.updatedAt
				? new Date(data.project.updatedAt).getTime()
				: 0;

			const recoveryData = await syncManager.checkForRecoveryData(
				data.project.id,
				serverVersion,
				serverUpdatedAt
			);

			if (recoveryData) {
				console.log('[EditorPage] Recovery data found:', {
					localVersion: recoveryData.localVersion,
					serverVersion,
					localUpdatedAt: recoveryData.localUpdatedAt,
					serverUpdatedAt
				});

				// Show recovery dialog instead of auto-initializing
				recoveryInfo = recoveryData;
				showRecoveryDialog = true;

				// Still initialize but with server data for now
				await syncManager.initialize(data.project.id);
				syncManager.start();
				isInitialized = true;
			} else {
				// No recovery needed - normal initialization
				await syncManager.initialize(data.project.id);
				syncManager.start();
				isInitialized = true;

				console.log('[EditorPage] SyncManager initialized (no recovery needed)', {
					storeProjectId: project.projectId,
					storeShapesCount: project.shapes.length,
					storeHangingPositionsCount: project.hangingPositions.length,
					syncStatus: syncManager.syncStatus
				});
			}
		} catch (error) {
			console.error('[EditorPage] Failed to initialize SyncManager:', error);
			__initError = error instanceof Error ? error.message : 'Failed to initialize';
		}
	});

	// Handle recovery restore
	async function handleRecoveryRestore() {
		if (!syncManager || !recoveryInfo) return;

		isRecovering = true;
		try {
			console.log('[EditorPage] Restoring from cache');
			const success = await syncManager.restoreFromCache(recoveryInfo.projectId);
			if (success) {
				console.log('[EditorPage] Recovery successful');
				showRecoveryDialog = false;
				recoveryInfo = null;
			} else {
				console.error('[EditorPage] Recovery failed');
				__initError = 'Failed to restore from cache';
			}
		} catch (error) {
			console.error('[EditorPage] Recovery error:', error);
			_initError = error instanceof Error ? error.message : 'Recovery failed';
		} finally {
			isRecovering = false;
		}
	}

	// Handle recovery discard
	async function handleRecoveryDiscard() {
		if (!syncManager || !recoveryInfo) return;

		isRecovering = true;
		try {
			console.log('[EditorPage] Discarding local cache');
			await syncManager.discardCache(recoveryInfo.projectId);
			showRecoveryDialog = false;
			recoveryInfo = null;
			console.log('[EditorPage] Cache discarded, using server version');
		} catch (error) {
			console.error('[EditorPage] Discard error:', error);
			__initError = error instanceof Error ? error.message : 'Failed to discard cache';
		} finally {
			isRecovering = false;
		}
	}

	// Handle recovery dialog close (decide later)
	function handleRecoveryClose() {
		showRecoveryDialog = false;
		// Keep recoveryInfo in case they want to recover later
	}

	// Cleanup on destroy
	onDestroy(async () => {
		console.log('[EditorPage] onDestroy - disposing SyncManager', {
			projectId: data.project?.id,
			storeShapesCount: project.shapes.length
		});

		// Dispose SyncManager to save any pending changes
		if (syncManager) {
			const { disposeSyncManager } = await import('$lib/sync');
			await disposeSyncManager();
		}

		// Clear the project store for the next project
		project.clearProject();
	});

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
	 * Handle zoom preset selection (25%, 50%, 100%, 200%)
	 */
	function handleZoomPreset(zoomPercent: number) {
		const container = document.querySelector('.canvas-area');
		if (container) {
			const rect = container.getBoundingClientRect();
			viewport.setZoomPreset(zoomPercent / 100, rect.width, rect.height);
		}
	}

	/**
	 * Handle fit to content
	 * Calculates the bounds of all content and fits the viewport to show it all
	 */
	function handleFitContent() {
		const container = document.querySelector('.canvas-area');
		if (!container) return;

		// Calculate bounds of all objects
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		let hasContent = false;

		// Include hanging positions
		for (const hp of project.hangingPositions) {
			hasContent = true;
			minX = Math.min(minX, hp.x1, hp.x2);
			minY = Math.min(minY, hp.y1, hp.y2);
			maxX = Math.max(maxX, hp.x1, hp.x2);
			maxY = Math.max(maxY, hp.y1, hp.y2);
		}

		// Include instruments on hanging positions (get position from hanging position)
		for (const inst of project.instruments) {
			hasContent = true;
			const size = 48; // Approximate size in world units
			if (inst.hangingPositionId !== null) {
				// Find the hanging position to get coordinates
				const hp = project.hangingPositions.find((h) => h.id === inst.hangingPositionId);
				if (hp) {
					// Calculate position along the hanging position
					const instX = hp.x1 + (hp.x2 - hp.x1) * inst.positionOnBar;
					const instY = hp.y1 + (hp.y2 - hp.y1) * inst.positionOnBar;
					minX = Math.min(minX, instX - size / 2);
					minY = Math.min(minY, instY - size / 2);
					maxX = Math.max(maxX, instX + size / 2);
					maxY = Math.max(maxY, instY + size / 2);
				}
			} else if (inst.x !== undefined && inst.y !== undefined) {
				// Free-floating instrument
				minX = Math.min(minX, inst.x - size / 2);
				minY = Math.min(minY, inst.y - size / 2);
				maxX = Math.max(maxX, inst.x + size / 2);
				maxY = Math.max(maxY, inst.y + size / 2);
			}
		}

		// Include shapes
		for (const shape of project.shapes) {
			hasContent = true;
			const geom = shape.geometry;
			if (geom.type === 'line') {
				minX = Math.min(minX, geom.x1, geom.x2);
				minY = Math.min(minY, geom.y1, geom.y2);
				maxX = Math.max(maxX, geom.x1, geom.x2);
				maxY = Math.max(maxY, geom.y1, geom.y2);
			} else if (geom.type === 'rect') {
				minX = Math.min(minX, geom.x);
				minY = Math.min(minY, geom.y);
				maxX = Math.max(maxX, geom.x + geom.width);
				maxY = Math.max(maxY, geom.y + geom.height);
			} else if (geom.type === 'circle') {
				minX = Math.min(minX, geom.cx - geom.radius);
				minY = Math.min(minY, geom.cy - geom.radius);
				maxX = Math.max(maxX, geom.cx + geom.radius);
				maxY = Math.max(maxY, geom.cy + geom.radius);
			}
		}

		// Include set pieces
		for (const sp of project.setPieces) {
			hasContent = true;
			const geom = sp.geometry;
			if (geom.type === 'line') {
				minX = Math.min(minX, geom.x1, geom.x2);
				minY = Math.min(minY, geom.y1, geom.y2);
				maxX = Math.max(maxX, geom.x1, geom.x2);
				maxY = Math.max(maxY, geom.y1, geom.y2);
			} else if (geom.type === 'rect') {
				minX = Math.min(minX, geom.x);
				minY = Math.min(minY, geom.y);
				maxX = Math.max(maxX, geom.x + geom.width);
				maxY = Math.max(maxY, geom.y + geom.height);
			} else if (geom.type === 'circle') {
				minX = Math.min(minX, geom.cx - geom.radius);
				minY = Math.min(minY, geom.cy - geom.radius);
				maxX = Math.max(maxX, geom.cx + geom.radius);
				maxY = Math.max(maxY, geom.cy + geom.radius);
			}
		}

		// Include annotations
		for (const ann of project.annotations) {
			hasContent = true;
			// Annotations are text, approximate size
			const size = 100; // Approximate size in world units
			minX = Math.min(minX, ann.x - size / 2);
			minY = Math.min(minY, ann.y - size / 2);
			maxX = Math.max(maxX, ann.x + size / 2);
			maxY = Math.max(maxY, ann.y + size / 2);
		}

		// If no content, reset to origin view
		if (!hasContent || !isFinite(minX) || !isFinite(maxX)) {
			const rect = container.getBoundingClientRect();
			viewport.resetView(rect.width, rect.height);
			return;
		}

		// Calculate bounds
		const rect = container.getBoundingClientRect();
		const bounds = {
			x: minX,
			y: minY,
			width: maxX - minX,
			height: maxY - minY
		};

		// Fit with padding
		viewport.fitToContent(bounds, rect.width, rect.height, 50);
	}

	/**
	 * Handle reset view
	 */
	function handleResetView() {
		const container = document.querySelector('.canvas-area');
		if (container) {
			const rect = container.getBoundingClientRect();
			viewport.resetView(rect.width, rect.height);
		}
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

	/**
	 * Handle manual save triggered by Ctrl+S
	 */
	async function handleSave() {
		if (syncManager) {
			console.log('[EditorPage] Manual save triggered');
			await syncManager.syncToServer();
		}
	}
</script>

<!-- Global keyboard shortcuts handler -->
<KeyboardShortcuts onSave={handleSave} />

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
				<h2 class="project-name">{project.projectName}</h2>
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

				<!-- Zoom Preset Dropdown -->
				<select
					class="zoom-select"
					value={Math.round(viewport.zoom * 100)}
					onchange={(e) => handleZoomPreset(parseInt(e.currentTarget.value))}
					aria-label="Zoom level"
				>
					<option value="25">25%</option>
					<option value="50">50%</option>
					<option value="75">75%</option>
					<option value="100">100%</option>
					<option value="150">150%</option>
					<option value="200">200%</option>
					<option
						value={Math.round(viewport.zoom * 100)}
						selected
						disabled={[25, 50, 75, 100, 150, 200].includes(Math.round(viewport.zoom * 100))}
					>
						{viewport.zoomPercent}%
					</option>
				</select>

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

		<!-- Offline Indicator -->
		<OfflineIndicator />

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

<!-- Recovery Dialog for crash recovery -->
<RecoveryDialog
	open={showRecoveryDialog}
	{recoveryInfo}
	{isRecovering}
	onRestore={handleRecoveryRestore}
	onDiscard={handleRecoveryDiscard}
	onClose={handleRecoveryClose}
/>

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
		background: var(--color-mantle, #181825);
		border-right: 1px solid var(--color-surface1, #45475a);
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
		background: var(--color-mantle, #181825);
		border-bottom: 1px solid var(--color-surface1, #45475a);
	}

	.toolbar-section {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.toolbar-divider {
		width: 1px;
		height: 24px;
		background: var(--color-surface1, #45475a);
		margin: 0 8px;
	}

	.project-name {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text, #cdd6f4);
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
		color: var(--color-subtext0, #a6adc8);
		cursor: pointer;
	}

	.toolbar-btn:hover {
		background: var(--color-surface0, #313244);
		color: var(--color-text, #cdd6f4);
	}

	.icon {
		width: 16px;
		height: 16px;
	}

	.zoom-controls {
		gap: 8px;
	}

	.zoom-select {
		width: 72px;
		height: 32px;
		padding: 0 8px;
		background-color: var(--color-surface0, #313244);
		border: 1px solid var(--color-surface1, #45475a);
		border-radius: 4px;
		color: var(--color-text, #cdd6f4);
		font-size: 12px;
		cursor: pointer;
		transition:
			border-color 0.2s,
			background-color 0.2s;
	}

	.zoom-select:hover {
		background-color: var(--color-surface1, #45475a);
		border-color: var(--color-surface2, #585b70);
	}

	.zoom-select:focus {
		outline: none;
		border-color: var(--color-blue, #89b4fa);
	}

	.zoom-percent {
		width: 48px;
		text-align: center;
		font-size: 12px;
		color: var(--color-subtext0, #a6adc8);
	}

	.canvas-area {
		flex: 1;
		position: relative;
		overflow: hidden;
		background: var(--color-base, #1e1e2e);
	}

	.status-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 24px;
		padding: 0 16px;
		background: var(--color-crust, #11111b);
		border-top: 1px solid var(--color-surface1, #45475a);
		font-size: 11px;
		color: var(--color-subtext0, #a6adc8);
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-separator {
		color: var(--color-surface2, #585b70);
	}

	.status-highlight {
		color: var(--color-blue, #89b4fa);
	}

	.flex-1 {
		flex: 1;
	}
</style>
