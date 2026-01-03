<script lang="ts">
	/**
	 * Viewport Component
	 *
	 * Full-width/height SVG container with pan/zoom functionality.
	 * Handles mouse and touch events for canvas navigation.
	 */
	import { viewport } from '$lib/stores/viewport.svelte';
	import Grid from './Grid.svelte';

	interface Props {
		/** Whether spacebar pan mode is active (controlled by parent) */
		spacebarHeld?: boolean;
	}

	let { spacebarHeld = false, children }: Props & { children?: import('svelte').Snippet } =
		$props();

	// Track viewport dimensions for Grid component
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);

	// Local state for interaction tracking
	let isPanning = $state(false);
	let lastMouseX = $state(0);
	let lastMouseY = $state(0);

	// Touch gesture state
	let isTouchPanning = $state(false);
	let lastTouchDistance = $state(0);
	let lastTouchCenterX = $state(0);
	let lastTouchCenterY = $state(0);

	// SVG element reference
	let svgElement: SVGSVGElement;

	// Zoom configuration
	const ZOOM_SENSITIVITY = 0.001; // Mouse wheel sensitivity
	const ZOOM_FACTOR_STEP = 1.1; // Step factor per scroll "unit"

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
	 * Handle mouse down - start pan if middle button or spacebar held
	 */
	function handleMouseDown(event: MouseEvent) {
		const coords = getRelativeCoords(event);

		// Middle mouse button (button 1) or spacebar held
		if (event.button === 1 || spacebarHeld) {
			event.preventDefault();
			isPanning = true;
			lastMouseX = coords.x;
			lastMouseY = coords.y;
		}
	}

	/**
	 * Handle mouse move - pan if in pan mode
	 */
	function handleMouseMove(event: MouseEvent) {
		if (!isPanning) return;

		const coords = getRelativeCoords(event);
		const dx = coords.x - lastMouseX;
		const dy = coords.y - lastMouseY;

		viewport.pan(dx, dy);

		lastMouseX = coords.x;
		lastMouseY = coords.y;
	}

	/**
	 * Handle mouse up - stop panning
	 */
	function handleMouseUp() {
		isPanning = false;
	}

	/**
	 * Handle mouse leave - stop panning if mouse leaves viewport
	 */
	function handleMouseLeave() {
		isPanning = false;
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

	// Derived cursor style
	const cursorStyle = $derived.by(() => {
		if (isPanning || isTouchPanning) return 'grabbing';
		if (spacebarHeld) return 'grab';
		return 'default';
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
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
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

		<!-- Slot for child content -->
		{#if children}
			{@render children()}
		{/if}
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
		fill: var(--color-bg-primary);
	}
</style>
