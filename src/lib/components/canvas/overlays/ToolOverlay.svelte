<script lang="ts">
	/**
	 * ToolOverlay Component
	 *
	 * Renders drawing preview (ghost shapes) during tool interactions.
	 * Handles mouse events for drawing operations.
	 *
	 * Integrates with SyncManager to mark the project as dirty when
	 * objects are created, triggering automatic save to IndexedDB and server.
	 */
	import { viewport } from '$lib/stores/viewport.svelte';
	import { tool } from '$lib/stores/tool.svelte';
	import { grid } from '$lib/stores/grid.svelte';
	import { project } from '$lib/stores/project.svelte';
	import type { SyncManager } from '$lib/sync';
	import type { InstrumentType } from '$lib/types/instrument';
	import { onMount } from 'svelte';
	import { InstrumentSymbol } from '../symbols';
	import {
		findNearestWithEndpoints,
		DEFAULT_SNAP_THRESHOLD,
		type HangingPositionSnapResult
	} from '$lib/utils/snap';

	// SyncManager reference - initialized asynchronously to avoid SSR issues
	// The SyncManager uses $state runes which can't be instantiated during SSR
	let _syncManager: SyncManager | null = null;

	// Initialize SyncManager on mount (client-side only)
	onMount(async () => {
		try {
			const { getSyncManager } = await import('$lib/sync');
			_syncManager = getSyncManager();
			console.log('[ToolOverlay] SyncManager initialized');
		} catch (error) {
			console.error('[ToolOverlay] Failed to initialize SyncManager:', error);
		}
	});

	/**
	 * Mark the project as dirty to trigger sync
	 * Gracefully handles the case when SyncManager isn't initialized yet
	 */
	function markProjectDirty(): void {
		if (_syncManager) {
			_syncManager.markDirty();
			console.log('[ToolOverlay] Marked project dirty');
		} else {
			console.warn('[ToolOverlay] SyncManager not yet initialized, skipping markDirty');
		}
	}

	interface Props {
		/** SVG element reference for coordinate transformation */
		svgElement?: SVGSVGElement;
		/** Currently selected instrument type for add-instrument tool */
		selectedInstrumentType?: InstrumentType;
	}

	let { svgElement, selectedInstrumentType = 'ers-26' }: Props = $props();

	// Drawing state
	let isDrawing = $state(false);
	let drawStartX = $state(0);
	let drawStartY = $state(0);
	let drawCurrentX = $state(0);
	let drawCurrentY = $state(0);

	// Instrument placement state
	let cursorX = $state(0);
	let cursorY = $state(0);
	let snapResult = $state<HangingPositionSnapResult | null>(null);

	// Snap threshold adjusted for zoom
	const snapThreshold = $derived(DEFAULT_SNAP_THRESHOLD / viewport.zoom);

	// Ghost shape preview dimensions (derived)
	const ghostLine = $derived.by(() => {
		if (!isDrawing || tool.activeTool !== 'draw-line') return null;
		return {
			x1: drawStartX,
			y1: drawStartY,
			x2: drawCurrentX,
			y2: drawCurrentY
		};
	});

	const ghostRect = $derived.by(() => {
		if (!isDrawing || tool.activeTool !== 'draw-rect') return null;
		const x = Math.min(drawStartX, drawCurrentX);
		const y = Math.min(drawStartY, drawCurrentY);
		const width = Math.abs(drawCurrentX - drawStartX);
		const height = Math.abs(drawCurrentY - drawStartY);
		return { x, y, width, height };
	});

	const ghostCircle = $derived.by(() => {
		if (!isDrawing || tool.activeTool !== 'draw-circle') return null;
		const dx = drawCurrentX - drawStartX;
		const dy = drawCurrentY - drawStartY;
		const radius = Math.sqrt(dx * dx + dy * dy);
		return { cx: drawStartX, cy: drawStartY, radius };
	});

	const ghostElectric = $derived.by(() => {
		if (!isDrawing || tool.activeTool !== 'add-electric') return null;
		return {
			x1: drawStartX,
			y1: drawStartY,
			x2: drawCurrentX,
			y2: drawCurrentY
		};
	});

	const ghostBoom = $derived.by(() => {
		if (!isDrawing || tool.activeTool !== 'add-boom') return null;
		return {
			x1: drawStartX,
			y1: drawStartY,
			x2: drawCurrentX,
			y2: drawCurrentY
		};
	});

	// Dimension feedback during drawing
	const dimensionText = $derived.by(() => {
		if (!isDrawing) return null;

		const pixelsPerUnit = grid.pixelsPerUnit;
		const unit = grid.unit === 'feet' ? "'" : 'm';

		switch (tool.activeTool) {
			case 'draw-line':
			case 'add-electric':
			case 'add-boom': {
				const dx = drawCurrentX - drawStartX;
				const dy = drawCurrentY - drawStartY;
				const length = Math.sqrt(dx * dx + dy * dy) / pixelsPerUnit;
				return `${length.toFixed(1)}${unit}`;
			}
			case 'draw-rect': {
				const width = Math.abs(drawCurrentX - drawStartX) / pixelsPerUnit;
				const height = Math.abs(drawCurrentY - drawStartY) / pixelsPerUnit;
				return `${width.toFixed(1)}${unit} × ${height.toFixed(1)}${unit}`;
			}
			case 'draw-circle': {
				const dx = drawCurrentX - drawStartX;
				const dy = drawCurrentY - drawStartY;
				const radius = Math.sqrt(dx * dx + dy * dy) / pixelsPerUnit;
				return `r = ${radius.toFixed(1)}${unit}`;
			}
			default:
				return null;
		}
	});

	// Dimension label position
	const dimensionPosition = $derived.by(() => {
		if (!isDrawing) return null;
		return {
			x: (drawStartX + drawCurrentX) / 2,
			y: (drawStartY + drawCurrentY) / 2 - 15 / viewport.zoom
		};
	});

	// Ghost instrument preview position
	const ghostInstrument = $derived.by(() => {
		if (tool.activeTool !== 'add-instrument') return null;

		// Use snap result if available and within threshold
		if (snapResult && snapResult.distance < snapThreshold) {
			return {
				x: snapResult.x,
				y: snapResult.y,
				snappedToPosition: true,
				hangingPositionId: snapResult.id,
				positionOnBar: snapResult.positionOnBar,
				rotation: 0 // Default rotation (pointing upstage)
			};
		}

		return {
			x: cursorX,
			y: cursorY,
			snappedToPosition: false,
			hangingPositionId: null,
			positionOnBar: 0.5,
			rotation: 0
		};
	});

	/**
	 * Get world coordinates from a mouse event
	 */
	function getWorldCoords(event: MouseEvent): { x: number; y: number } {
		if (!svgElement) return { x: 0, y: 0 };
		const rect = svgElement.getBoundingClientRect();
		const screenX = event.clientX - rect.left;
		const screenY = event.clientY - rect.top;
		return viewport.screenToWorld(screenX, screenY);
	}

	/**
	 * Snap coordinates to grid if enabled
	 */
	function snapCoords(x: number, y: number): { x: number; y: number } {
		return grid.snapPoint(x, y);
	}

	/**
	 * Find the nearest hanging position to a point using snap utility
	 */
	function updateSnapResult(x: number, y: number): void {
		snapResult = findNearestWithEndpoints(x, y, project.hangingPositions, snapThreshold, {
			snapToEndpoints: true,
			snapToCenter: true,
			endpointPriorityMultiplier: 0.5
		});
	}

	/**
	 * Handle mouse down to start drawing or place instrument
	 */
	export function handleMouseDown(event: MouseEvent): boolean {
		// Handle instrument placement
		if (tool.activeTool === 'add-instrument') {
			event.preventDefault();
			event.stopPropagation();
			// Get fresh coordinates from the click event itself to ensure accuracy
			const coords = getWorldCoords(event);
			cursorX = coords.x;
			cursorY = coords.y;
			updateSnapResult(coords.x, coords.y);
			placeInstrument();
			return true;
		}

		// Only handle if a drawing tool or hanging position tool is active
		if (!tool.isDrawingTool && !tool.isHangingPositionTool) {
			return false;
		}

		event.preventDefault();
		event.stopPropagation();

		const coords = getWorldCoords(event);
		const snapped = snapCoords(coords.x, coords.y);

		isDrawing = true;
		drawStartX = snapped.x;
		drawStartY = snapped.y;
		drawCurrentX = snapped.x;
		drawCurrentY = snapped.y;

		return true;
	}

	/**
	 * Handle mouse move during drawing or instrument placement
	 */
	export function handleMouseMove(event: MouseEvent): boolean {
		const coords = getWorldCoords(event);

		// Always update cursor position for instrument placement preview
		if (tool.activeTool === 'add-instrument') {
			cursorX = coords.x;
			cursorY = coords.y;
			updateSnapResult(coords.x, coords.y);
			return true;
		}

		if (!isDrawing) return false;

		const snapped = snapCoords(coords.x, coords.y);

		// Constrain to horizontal/vertical with shift key
		if (event.shiftKey) {
			const dx = Math.abs(snapped.x - drawStartX);
			const dy = Math.abs(snapped.y - drawStartY);
			if (dx > dy) {
				drawCurrentX = snapped.x;
				drawCurrentY = drawStartY;
			} else {
				drawCurrentX = drawStartX;
				drawCurrentY = snapped.y;
			}
		} else {
			drawCurrentX = snapped.x;
			drawCurrentY = snapped.y;
		}

		return true;
	}

	/**
	 * Place an instrument at the current cursor position and mark project as dirty
	 */
	function placeInstrument(): void {
		if (!ghostInstrument) return;

		// If snapped to a hanging position, place on that position
		if (ghostInstrument.snappedToPosition && ghostInstrument.hangingPositionId) {
			project.addInstrument(
				ghostInstrument.hangingPositionId,
				ghostInstrument.positionOnBar,
				selectedInstrumentType,
				{
					rotation: ghostInstrument.rotation
				}
			);
		} else {
			// Place as a free-floating instrument at the cursor position
			const snapped = snapCoords(ghostInstrument.x, ghostInstrument.y);
			project.addFreeInstrument(snapped.x, snapped.y, selectedInstrumentType, {
				rotation: ghostInstrument.rotation
			});
		}

		// Mark project as dirty to trigger sync
		markProjectDirty();
	}

	/**
	 * Handle mouse up to complete drawing
	 */
	export function handleMouseUp(event: MouseEvent): boolean {
		if (!isDrawing) return false;

		const coords = getWorldCoords(event);
		const snapped = snapCoords(coords.x, coords.y);

		// Apply shift constraint for final position
		let finalX = snapped.x;
		let finalY = snapped.y;
		if (event.shiftKey) {
			const dx = Math.abs(snapped.x - drawStartX);
			const dy = Math.abs(snapped.y - drawStartY);
			if (dx > dy) {
				finalY = drawStartY;
			} else {
				finalX = drawStartX;
			}
		}

		// Create the object based on tool type
		createObject(drawStartX, drawStartY, finalX, finalY);

		// Reset drawing state
		isDrawing = false;
		drawStartX = 0;
		drawStartY = 0;
		drawCurrentX = 0;
		drawCurrentY = 0;

		return true;
	}

	/**
	 * Create an object based on the current tool and mark project as dirty
	 */
	function createObject(x1: number, y1: number, x2: number, y2: number): void {
		// Don't create zero-size shapes
		const minSize = 5;
		const dx = Math.abs(x2 - x1);
		const dy = Math.abs(y2 - y1);
		let objectCreated = false;

		switch (tool.activeTool) {
			case 'draw-line':
				if (dx > minSize || dy > minSize) {
					project.addSetPieceLine(x1, y1, x2, y2);
					objectCreated = true;
				}
				break;
			case 'draw-rect':
				if (dx > minSize && dy > minSize) {
					const x = Math.min(x1, x2);
					const y = Math.min(y1, y2);
					project.addSetPieceRectangle(x, y, dx, dy);
					objectCreated = true;
				}
				break;
			case 'draw-circle': {
				const radius = Math.sqrt(dx * dx + dy * dy);
				if (radius > minSize) {
					project.addSetPieceCircle(x1, y1, radius);
					objectCreated = true;
				}
				break;
			}
			case 'add-electric':
				if (dx > minSize || dy > minSize) {
					project.addElectric(x1, y1, x2, y2);
					objectCreated = true;
				}
				break;
			case 'add-boom':
				if (dx > minSize || dy > minSize) {
					project.addBoom(x1, y1, x2, y2);
					objectCreated = true;
				}
				break;
		}

		// Mark project as dirty to trigger sync
		if (objectCreated) {
			markProjectDirty();
		}
	}

	/**
	 * Cancel drawing (e.g., on Escape)
	 */
	export function cancelDrawing(): void {
		isDrawing = false;
		drawStartX = 0;
		drawStartY = 0;
		drawCurrentX = 0;
		drawCurrentY = 0;
	}

	// Stroke width that scales with zoom
	const strokeWidth = $derived(2 / viewport.zoom);
	const dashArray = $derived(`${4 / viewport.zoom},${4 / viewport.zoom}`);
	const fontSize = $derived(12 / viewport.zoom);
</script>

<g class="tool-overlay">
	<!-- Ghost line preview -->
	{#if ghostLine}
		<line
			class="ghost-shape ghost-line"
			x1={ghostLine.x1}
			y1={ghostLine.y1}
			x2={ghostLine.x2}
			y2={ghostLine.y2}
			stroke-width={strokeWidth}
			stroke-dasharray={dashArray}
		/>
		<!-- Start point indicator -->
		<circle class="ghost-point" cx={ghostLine.x1} cy={ghostLine.y1} r={4 / viewport.zoom} />
	{/if}

	<!-- Ghost rectangle preview -->
	{#if ghostRect}
		<rect
			class="ghost-shape ghost-rect"
			x={ghostRect.x}
			y={ghostRect.y}
			width={ghostRect.width}
			height={ghostRect.height}
			stroke-width={strokeWidth}
			stroke-dasharray={dashArray}
		/>
	{/if}

	<!-- Ghost circle preview -->
	{#if ghostCircle}
		<circle
			class="ghost-shape ghost-circle"
			cx={ghostCircle.cx}
			cy={ghostCircle.cy}
			r={ghostCircle.radius}
			stroke-width={strokeWidth}
			stroke-dasharray={dashArray}
		/>
		<!-- Center point indicator -->
		<circle class="ghost-point" cx={ghostCircle.cx} cy={ghostCircle.cy} r={4 / viewport.zoom} />
		<!-- Radius line -->
		<line
			class="ghost-radius-line"
			x1={ghostCircle.cx}
			y1={ghostCircle.cy}
			x2={drawCurrentX}
			y2={drawCurrentY}
			stroke-width={strokeWidth / 2}
			stroke-dasharray={dashArray}
		/>
	{/if}

	<!-- Ghost electric preview -->
	{#if ghostElectric}
		<line
			class="ghost-shape ghost-electric"
			x1={ghostElectric.x1}
			y1={ghostElectric.y1}
			x2={ghostElectric.x2}
			y2={ghostElectric.y2}
			stroke-width={strokeWidth * 2}
			stroke-dasharray={dashArray}
		/>
		<!-- End caps -->
		<circle
			class="ghost-point ghost-electric-point"
			cx={ghostElectric.x1}
			cy={ghostElectric.y1}
			r={6 / viewport.zoom}
		/>
		<circle
			class="ghost-point ghost-electric-point"
			cx={ghostElectric.x2}
			cy={ghostElectric.y2}
			r={6 / viewport.zoom}
		/>
	{/if}

	<!-- Ghost boom preview -->
	{#if ghostBoom}
		<line
			class="ghost-shape ghost-boom"
			x1={ghostBoom.x1}
			y1={ghostBoom.y1}
			x2={ghostBoom.x2}
			y2={ghostBoom.y2}
			stroke-width={strokeWidth * 2}
			stroke-dasharray={dashArray}
		/>
		<!-- Base plate at start, small circle at top -->
		<rect
			class="ghost-point ghost-boom-base"
			x={ghostBoom.x1 - 6 / viewport.zoom}
			y={ghostBoom.y1 - 6 / viewport.zoom}
			width={12 / viewport.zoom}
			height={12 / viewport.zoom}
		/>
		<circle
			class="ghost-point ghost-boom-point"
			cx={ghostBoom.x2}
			cy={ghostBoom.y2}
			r={4 / viewport.zoom}
		/>
	{/if}

	<!-- Snap indicator: highlight the target hanging position -->
	{#if ghostInstrument?.snappedToPosition && snapResult}
		{@const hp = snapResult.hangingPosition}
		<g class="snap-indicator">
			<!-- Highlight the entire hanging position line -->
			<line
				class="snap-highlight-line"
				x1={hp.x1}
				y1={hp.y1}
				x2={hp.x2}
				y2={hp.y2}
				stroke-width={strokeWidth * 4}
			/>
			<!-- Snap point indicator -->
			<circle class="snap-point" cx={snapResult.x} cy={snapResult.y} r={8 / viewport.zoom} />
			<!-- Small connecting line from cursor to snap point -->
			{#if Math.abs(cursorX - snapResult.x) > 1 || Math.abs(cursorY - snapResult.y) > 1}
				<line
					class="snap-connector"
					x1={cursorX}
					y1={cursorY}
					x2={snapResult.x}
					y2={snapResult.y}
					stroke-width={strokeWidth / 2}
					stroke-dasharray={dashArray}
				/>
			{/if}
		</g>
	{/if}

	<!-- Instrument preview with actual symbol -->
	{#if ghostInstrument}
		<g
			class="ghost-instrument"
			class:snapped={ghostInstrument.snappedToPosition}
			style="opacity: 0.7;"
		>
			<InstrumentSymbol
				type={selectedInstrumentType}
				x={ghostInstrument.x}
				y={ghostInstrument.y}
				rotation={ghostInstrument.rotation}
				isSelected={false}
				isHovered={false}
			/>
		</g>

		<!-- Crosshair at cursor position (when not snapped) -->
		{#if !ghostInstrument.snappedToPosition}
			<g class="instrument-cursor" transform="translate({cursorX}, {cursorY})">
				<line
					class="cursor-crosshair"
					x1={-10 / viewport.zoom}
					y1={0}
					x2={10 / viewport.zoom}
					y2={0}
					stroke-width={strokeWidth}
				/>
				<line
					class="cursor-crosshair"
					x1={0}
					y1={-10 / viewport.zoom}
					x2={0}
					y2={10 / viewport.zoom}
					stroke-width={strokeWidth}
				/>
			</g>
		{/if}
	{/if}

	<!-- Dimension feedback -->
	<!-- Note: scale(1, -1) counter-flips the text since the viewport Y axis is flipped -->
	{#if dimensionText && dimensionPosition}
		<g
			class="dimension-feedback"
			transform="translate({dimensionPosition.x}, {dimensionPosition.y}) scale(1, -1)"
		>
			<rect
				class="dimension-background"
				x={-30 / viewport.zoom}
				y={-8 / viewport.zoom}
				width={60 / viewport.zoom}
				height={16 / viewport.zoom}
				rx={3 / viewport.zoom}
			/>
			<text
				class="dimension-text"
				text-anchor="middle"
				dominant-baseline="central"
				font-size={fontSize}
			>
				{dimensionText}
			</text>
		</g>
	{/if}
</g>

<style>
	.ghost-shape {
		fill: rgba(66, 135, 245, 0.1);
		stroke: #4287f5;
		pointer-events: none;
	}

	.ghost-line,
	.ghost-radius-line {
		fill: none;
	}

	.ghost-electric {
		fill: none;
		stroke: #fab387; /* Catppuccin peach */
	}

	.ghost-boom {
		fill: none;
		stroke: #a6e3a1; /* Catppuccin green */
	}

	.ghost-point {
		fill: #89b4fa; /* Catppuccin blue */
		stroke: none;
		pointer-events: none;
	}

	.ghost-electric-point {
		fill: #fab387; /* Catppuccin peach */
	}

	.ghost-boom-base,
	.ghost-boom-point {
		fill: #a6e3a1; /* Catppuccin green */
	}

	.dimension-background {
		fill: rgba(17, 17, 27, 0.85); /* Catppuccin crust */
		stroke: none;
	}

	.dimension-text {
		fill: #cdd6f4; /* Catppuccin text */
		font-family: system-ui, sans-serif;
		pointer-events: none;
	}

	/* Instrument cursor crosshair styles */
	.instrument-cursor {
		pointer-events: none;
	}

	.cursor-crosshair {
		stroke: #89b4fa; /* Catppuccin blue */
		fill: none;
	}

	/* Ghost instrument preview */
	.ghost-instrument {
		pointer-events: none;
	}

	.ghost-instrument.snapped :global(.symbol-body) {
		stroke: #a6e3a1; /* Catppuccin green when snapped */
	}

	/* Snap indicator styles */
	.snap-indicator {
		pointer-events: none;
	}

	.snap-highlight-line {
		stroke: #a6e3a1; /* Catppuccin green */
		stroke-opacity: 0.4;
		fill: none;
	}

	.snap-point {
		fill: #a6e3a1; /* Catppuccin green */
		fill-opacity: 0.8;
		stroke: #a6e3a1;
		stroke-width: 2;
		stroke-opacity: 0.4;
	}

	.snap-connector {
		stroke: #a6e3a1; /* Catppuccin green */
		stroke-opacity: 0.6;
		fill: none;
	}
</style>
