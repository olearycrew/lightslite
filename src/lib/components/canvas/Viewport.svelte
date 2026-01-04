<script lang="ts">
	/**
	 * Viewport Component
	 *
	 * Full-width/height SVG container with pan/zoom functionality.
	 * Handles mouse and touch events for canvas navigation.
	 * Includes selection handling, marquee selection, and drawing tool support.
	 */
	import { viewport, type Bounds } from '$lib/stores/viewport.svelte';
	import { selection } from '$lib/stores/selection.svelte';
	import { tool } from '$lib/stores/tool.svelte';
	import { project } from '$lib/stores/project.svelte';
	import Grid from './Grid.svelte';
	import { SelectionOverlay, ToolOverlay } from './overlays';
	import { DrawingLayer } from './layers';

	interface Props {
		/** Whether spacebar pan mode is active (controlled by parent) */
		spacebarHeld?: boolean;
		/** Whether to show the drawing layer */
		showDrawingLayer?: boolean;
	}

	let {
		spacebarHeld = false,
		showDrawingLayer = true,
		children
	}: Props & { children?: import('svelte').Snippet } = $props();

	// Track viewport dimensions for Grid component
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);

	// Local state for interaction tracking
	let isPanning = $state(false);
	let lastMouseX = $state(0);
	let lastMouseY = $state(0);

	// Marquee selection state
	let isMarqueeActive = $state(false);
	let marqueeStartX = $state(0);
	let marqueeStartY = $state(0);
	let marqueeEndX = $state(0);
	let marqueeEndY = $state(0);

	// Touch gesture state
	let isTouchPanning = $state(false);
	let lastTouchDistance = $state(0);
	let lastTouchCenterX = $state(0);
	let lastTouchCenterY = $state(0);

	// Drawing state - managed by ToolOverlay but we need to track if drawing is active
	let isDrawing = $state(false);

	// Track if viewport has been initialized (for centering origin)
	let hasInitialized = $state(false);

	// SVG element reference
	let svgElement: SVGSVGElement;

	// ToolOverlay reference for delegating events
	let toolOverlayRef:
		| {
				handleMouseDown: (e: MouseEvent) => boolean;
				handleMouseMove: (e: MouseEvent) => boolean;
				handleMouseUp: (e: MouseEvent) => boolean;
				cancelDrawing: () => void;
		  }
		| undefined = $state();

	// Zoom configuration
	const ZOOM_SENSITIVITY = 0.001; // Mouse wheel sensitivity
	const ZOOM_FACTOR_STEP = 1.1; // Step factor per scroll "unit"

	// Marquee bounds (derived from start/end points)
	const marqueeBounds = $derived.by((): Bounds | null => {
		if (!isMarqueeActive) return null;
		return {
			x: Math.min(marqueeStartX, marqueeEndX),
			y: Math.min(marqueeStartY, marqueeEndY),
			width: Math.abs(marqueeEndX - marqueeStartX),
			height: Math.abs(marqueeEndY - marqueeStartY)
		};
	});

	/**
	 * Get coordinates relative to the SVG element
	 */
	function getRelativeCoords(event: MouseEvent | Touch) {
		if (!svgElement) return { x: 0, y: 0 };
		const rect = svgElement.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	/**
	 * Handle mouse wheel for zooming
	 */
	function handleWheel(event: WheelEvent) {
		event.preventDefault();

		const coords = getRelativeCoords(event);

		// Calculate zoom factor based on wheel delta
		// Negative deltaY = scroll up = zoom in
		const delta = -event.deltaY * ZOOM_SENSITIVITY;
		const factor = Math.pow(ZOOM_FACTOR_STEP, delta * 10);

		viewport.zoomBy(factor, coords.x, coords.y);
	}

	/**
	 * Handle mouse down - delegate to drawing tools first, then pan/marquee
	 */
	function handleMouseDown(event: MouseEvent) {
		const coords = getRelativeCoords(event);

		// Middle mouse button (button 1) or spacebar held - pan mode
		if (event.button === 1 || spacebarHeld || tool.isPanTool) {
			event.preventDefault();
			isPanning = true;
			lastMouseX = coords.x;
			lastMouseY = coords.y;
			return;
		}

		// Try drawing tool first (if left click and drawing tool active)
		if (event.button === 0 && (tool.isDrawingTool || tool.activeTool === 'add-electric')) {
			if (toolOverlayRef?.handleMouseDown(event)) {
				isDrawing = true;
				return;
			}
		}

		// Left click on empty space - start marquee selection (if select tool is active)
		if (event.button === 0 && tool.isSelectTool) {
			event.preventDefault();
			const worldCoords = viewport.screenToWorld(coords.x, coords.y);

			// If shift is not held, clear existing selection before starting marquee
			if (!event.shiftKey) {
				selection.clearSelection();
			}

			// Start marquee
			isMarqueeActive = true;
			marqueeStartX = worldCoords.x;
			marqueeStartY = worldCoords.y;
			marqueeEndX = worldCoords.x;
			marqueeEndY = worldCoords.y;
		}
	}

	/**
	 * Handle mouse move - delegate to drawing tool or handle pan/marquee
	 */
	function handleMouseMove(event: MouseEvent) {
		const coords = getRelativeCoords(event);

		// If drawing, delegate to tool overlay
		if (isDrawing) {
			toolOverlayRef?.handleMouseMove(event);
			return;
		}

		if (isPanning) {
			const dx = coords.x - lastMouseX;
			const dy = coords.y - lastMouseY;

			viewport.pan(dx, dy);

			lastMouseX = coords.x;
			lastMouseY = coords.y;
			return;
		}

		if (isMarqueeActive) {
			const worldCoords = viewport.screenToWorld(coords.x, coords.y);
			marqueeEndX = worldCoords.x;
			marqueeEndY = worldCoords.y;
		}
	}

	/**
	 * Handle mouse up - complete drawing, pan, or marquee
	 */
	function handleMouseUp(event: MouseEvent) {
		// If drawing, delegate to tool overlay
		if (isDrawing) {
			toolOverlayRef?.handleMouseUp(event);
			isDrawing = false;
			return;
		}

		if (isPanning) {
			isPanning = false;
			return;
		}

		if (isMarqueeActive) {
			// Complete marquee selection
			// Note: Actual object selection will be handled by a parent component
			// that can query which objects intersect the marquee bounds
			// For now, we emit the bounds via a custom event or callback

			isMarqueeActive = false;
			// marqueeSelectEnd callback would be called here with marqueeBounds
		}
	}

	/**
	 * Handle mouse leave - stop panning if mouse leaves viewport
	 */
	function handleMouseLeave() {
		isPanning = false;
		// Don't cancel marquee or drawing on leave - let mouse up handle it
	}

	/**
	 * Calculate distance between two touch points
	 */
	function getTouchDistance(touch1: Touch, touch2: Touch) {
		const dx = touch2.clientX - touch1.clientX;
		const dy = touch2.clientY - touch1.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * Calculate center point between two touches
	 */
	function getTouchCenter(touch1: Touch, touch2: Touch) {
		return {
			x: (touch1.clientX + touch2.clientX) / 2,
			y: (touch1.clientY + touch2.clientY) / 2
		};
	}

	/**
	 * Handle touch start - begin pan or pinch zoom
	 */
	function handleTouchStart(event: TouchEvent) {
		if (event.touches.length === 1) {
			// Single finger - prepare for pan
			const touch = event.touches[0];
			const coords = getRelativeCoords(touch);
			lastTouchCenterX = coords.x;
			lastTouchCenterY = coords.y;
			isTouchPanning = true;
		} else if (event.touches.length === 2) {
			// Two fingers - prepare for pinch zoom
			event.preventDefault();
			const touch1 = event.touches[0];
			const touch2 = event.touches[1];

			lastTouchDistance = getTouchDistance(touch1, touch2);
			const center = getTouchCenter(touch1, touch2);
			const coords = getRelativeCoords({
				clientX: center.x,
				clientY: center.y
			} as Touch);
			lastTouchCenterX = coords.x;
			lastTouchCenterY = coords.y;
			isTouchPanning = true;
		}
	}

	/**
	 * Handle touch move - pan or pinch zoom
	 */
	function handleTouchMove(event: TouchEvent) {
		if (event.touches.length === 1 && isTouchPanning) {
			// Single finger pan
			const touch = event.touches[0];
			const coords = getRelativeCoords(touch);

			const dx = coords.x - lastTouchCenterX;
			const dy = coords.y - lastTouchCenterY;

			viewport.pan(dx, dy);

			lastTouchCenterX = coords.x;
			lastTouchCenterY = coords.y;
		} else if (event.touches.length === 2) {
			// Two finger pinch zoom + pan
			event.preventDefault();
			const touch1 = event.touches[0];
			const touch2 = event.touches[1];

			// Calculate new distance and center
			const newDistance = getTouchDistance(touch1, touch2);
			const center = getTouchCenter(touch1, touch2);
			const coords = getRelativeCoords({
				clientX: center.x,
				clientY: center.y
			} as Touch);

			// Pinch zoom
			if (lastTouchDistance > 0) {
				const zoomFactor = newDistance / lastTouchDistance;
				viewport.zoomBy(zoomFactor, coords.x, coords.y);
			}

			// Two-finger pan
			const dx = coords.x - lastTouchCenterX;
			const dy = coords.y - lastTouchCenterY;
			viewport.pan(dx, dy);

			lastTouchDistance = newDistance;
			lastTouchCenterX = coords.x;
			lastTouchCenterY = coords.y;
		}
	}

	/**
	 * Handle touch end - stop gestures
	 */
	function handleTouchEnd(event: TouchEvent) {
		if (event.touches.length === 0) {
			isTouchPanning = false;
			lastTouchDistance = 0;
		} else if (event.touches.length === 1) {
			// Switched from two fingers to one
			const touch = event.touches[0];
			const coords = getRelativeCoords(touch);
			lastTouchCenterX = coords.x;
			lastTouchCenterY = coords.y;
			lastTouchDistance = 0;
		}
	}

	/**
	 * Prevent default context menu on right-click (future use)
	 */
	function handleContextMenu(event: MouseEvent) {
		event.preventDefault();
	}

	/**
	 * Handle keyboard events for shortcuts
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Check if we're focused on an input element
		const activeElement = document.activeElement;
		if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
			return;
		}

		// Escape - clear selection and cancel drawing
		if (event.key === 'Escape') {
			event.preventDefault();
			selection.clearSelection();
			// Cancel any active marquee
			isMarqueeActive = false;
			// Cancel any active drawing
			if (isDrawing) {
				toolOverlayRef?.cancelDrawing();
				isDrawing = false;
			}
			return;
		}

		// Delete or Backspace - delete selected objects
		if (event.key === 'Delete' || event.key === 'Backspace') {
			if (selection.hasSelection) {
				event.preventDefault();
				// Delete selected objects from project store
				project.deleteObjects(selection.selectedIds);
				selection.clearSelection();
			}
			return;
		}

		// Ctrl/Cmd + A - select all
		if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
			event.preventDefault();
			// TODO: Implement select all when we have a list of all selectable items
			return;
		}
	}

	// Derived cursor style
	const cursorStyle = $derived.by(() => {
		if (isPanning || isTouchPanning) return 'grabbing';
		if (spacebarHeld || tool.isPanTool) return 'grab';
		if (isMarqueeActive || isDrawing) return 'crosshair';
		return tool.cursor;
	});

	// Update viewport dimensions when SVG is bound or resized
	$effect(() => {
		if (!svgElement) return;

		const updateDimensions = () => {
			const rect = svgElement.getBoundingClientRect();
			viewportWidth = rect.width;
			viewportHeight = rect.height;
		};

		// Initial measurement
		updateDimensions();

		// Watch for resize
		const resizeObserver = new ResizeObserver(updateDimensions);
		resizeObserver.observe(svgElement);

		return () => {
			resizeObserver.disconnect();
		};
	});

	// Initialize viewport with origin centered when dimensions are first available
	$effect(() => {
		if (!hasInitialized && viewportWidth > 0 && viewportHeight > 0) {
			viewport.initializeWithCenter(viewportWidth, viewportHeight);
			hasInitialized = true;
		}
	});

	// Setup keyboard event listener
	$effect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<svg
	bind:this={svgElement}
	class="viewport-svg"
	style:cursor={cursorStyle}
	role="img"
	aria-label="Canvas viewport"
	onwheel={handleWheel}
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseLeave}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	oncontextmenu={handleContextMenu}
>
	<!-- Background for capturing events on empty areas -->
	<rect class="viewport-background" x="-100000" y="-100000" width="200000" height="200000" />

	<!-- Transform group - all content goes here -->
	<g transform={viewport.transform}>
		<!-- Grid component - renders based on viewport bounds -->
		<Grid {viewportWidth} {viewportHeight} />

		<!-- Drawing layer - renders all shapes from project store -->
		{#if showDrawingLayer}
			<DrawingLayer />
		{/if}

		<!-- Slot for additional child content -->
		{#if children}
			{@render children()}
		{/if}

		<!-- Tool overlay for drawing preview -->
		<ToolOverlay bind:this={toolOverlayRef} {svgElement} />

		<!-- Selection overlay (marquee, handles) -->
		<SelectionOverlay
			{isMarqueeActive}
			{marqueeBounds}
			selectionBounds={null}
			showResizeHandles={selection.isSingleSelection}
			showRotationHandle={selection.isSingleSelection}
			zoom={viewport.zoom}
		/>
	</g>
</svg>

<style>
	.viewport-svg {
		width: 100%;
		height: 100%;
		display: block;
		user-select: none;
		-webkit-user-select: none;
		touch-action: none; /* Prevent browser handling of touch gestures */
	}

	.viewport-background {
		fill: var(--color-base, #1e1e2e); /* Catppuccin Mocha base */
	}
</style>
