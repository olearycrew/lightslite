<script lang="ts">
	/**
	 * Viewport Component
	 *
	 * Full-width/height SVG container with pan/zoom functionality.
	 * Handles mouse and touch events for canvas navigation.
	 */
	import { viewport } from '$lib/stores/viewport.svelte';

	interface Props {
		/** Whether spacebar pan mode is active (controlled by parent) */
		spacebarHeld?: boolean;
	}

	let { spacebarHeld = false, children }: Props & { children?: import('svelte').Snippet } =
		$props();

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
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
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
		<!-- Grid pattern (subtle dots) -->
		<defs>
			<pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
				<circle cx="10" cy="10" r="0.5" fill="var(--color-border)" opacity="0.5" />
			</pattern>
			<pattern id="grid-lines" width="100" height="100" patternUnits="userSpaceOnUse">
				<path
					d="M 100 0 L 0 0 0 100"
					fill="none"
					stroke="var(--color-border)"
					stroke-width="0.5"
					opacity="0.3"
				/>
			</pattern>
		</defs>

		<!-- Grid background -->
		<rect x="-10000" y="-10000" width="20000" height="20000" fill="url(#grid-dots)" />
		<rect x="-10000" y="-10000" width="20000" height="20000" fill="url(#grid-lines)" />

		<!-- Test rectangle to verify transforms -->
		<rect
			x="0"
			y="0"
			width="200"
			height="100"
			fill="var(--color-accent)"
			opacity="0.3"
			stroke="var(--color-accent)"
			stroke-width="2"
		/>
		<text x="100" y="55" text-anchor="middle" fill="var(--color-text-primary)" font-size="14">
			Test Rectangle (200×100)
		</text>

		<!-- Origin crosshair -->
		<line x1="-20" y1="0" x2="20" y2="0" stroke="var(--color-error)" stroke-width="1" />
		<line x1="0" y1="-20" x2="0" y2="20" stroke="var(--color-error)" stroke-width="1" />
		<circle cx="0" cy="0" r="3" fill="var(--color-error)" />

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
