<script lang="ts">
	/**
	 * ToolOverlay Component
	 *
	 * Renders drawing preview (ghost shapes) during tool interactions.
	 * Handles mouse events for drawing operations.
	 */
	import { viewport } from '$lib/stores/viewport.svelte';
	import { tool } from '$lib/stores/tool.svelte';
	import { grid } from '$lib/stores/grid.svelte';
	import { project } from '$lib/stores/project.svelte';

	interface Props {
		/** SVG element reference for coordinate transformation */
		svgElement?: SVGSVGElement;
	}

	let { svgElement }: Props = $props();

	// Drawing state
	let isDrawing = $state(false);
	let drawStartX = $state(0);
	let drawStartY = $state(0);
	let drawCurrentX = $state(0);
	let drawCurrentY = $state(0);

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

	// Dimension feedback during drawing
	const dimensionText = $derived.by(() => {
		if (!isDrawing) return null;

		const pixelsPerUnit = grid.pixelsPerUnit;
		const unit = grid.unit === 'feet' ? "'" : 'm';

		switch (tool.activeTool) {
			case 'draw-line':
			case 'add-electric': {
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
	 * Handle mouse down to start drawing
	 */
	export function handleMouseDown(event: MouseEvent): boolean {
		// Only handle if a drawing tool is active
		if (!tool.isDrawingTool && tool.activeTool !== 'add-electric') {
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
	 * Handle mouse move during drawing
	 */
	export function handleMouseMove(event: MouseEvent): boolean {
		if (!isDrawing) return false;

		const coords = getWorldCoords(event);
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
	 * Create an object based on the current tool
	 */
	function createObject(x1: number, y1: number, x2: number, y2: number): void {
		// Don't create zero-size shapes
		const minSize = 5;
		const dx = Math.abs(x2 - x1);
		const dy = Math.abs(y2 - y1);

		switch (tool.activeTool) {
			case 'draw-line':
				if (dx > minSize || dy > minSize) {
					project.addLine(x1, y1, x2, y2);
				}
				break;
			case 'draw-rect':
				if (dx > minSize && dy > minSize) {
					const x = Math.min(x1, x2);
					const y = Math.min(y1, y2);
					project.addRectangle(x, y, dx, dy);
				}
				break;
			case 'draw-circle': {
				const radius = Math.sqrt(dx * dx + dy * dy);
				if (radius > minSize) {
					project.addCircle(x1, y1, radius);
				}
				break;
			}
			case 'add-electric':
				if (dx > minSize || dy > minSize) {
					project.addElectric(x1, y1, x2, y2);
				}
				break;
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
		<circle class="ghost-point" cx={ghostElectric.x1} cy={ghostElectric.y1} r={6 / viewport.zoom} />
		<circle class="ghost-point" cx={ghostElectric.x2} cy={ghostElectric.y2} r={6 / viewport.zoom} />
	{/if}

	<!-- Dimension feedback -->
	{#if dimensionText && dimensionPosition}
		<g
			class="dimension-feedback"
			transform="translate({dimensionPosition.x}, {dimensionPosition.y})"
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
		stroke: #f5a742;
	}

	.ghost-point {
		fill: #4287f5;
		stroke: none;
		pointer-events: none;
	}

	.ghost-electric + .ghost-point,
	.ghost-electric ~ .ghost-point {
		fill: #f5a742;
	}

	.dimension-background {
		fill: rgba(0, 0, 0, 0.7);
		stroke: none;
	}

	.dimension-text {
		fill: white;
		font-family: system-ui, sans-serif;
		pointer-events: none;
	}
</style>
