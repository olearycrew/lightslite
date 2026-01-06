<script lang="ts">
	/**
	 * Grid Component
	 *
	 * Renders a configurable grid for the canvas viewport.
	 * Features:
	 * - Adaptive density based on zoom level
	 * - Major/minor grid lines
	 * - Center line (vertical at x=0) - typically green
	 * - Plaster line (horizontal at y=0) - typically magenta
	 * - Performance optimized - only renders visible lines
	 */
	import { grid } from '$lib/stores/grid.svelte';
	import { viewport } from '$lib/stores/viewport.svelte';

	interface Props {
		/** Viewport width in pixels */
		viewportWidth: number;
		/** Viewport height in pixels */
		viewportHeight: number;
	}

	let { viewportWidth, viewportHeight }: Props = $props();

	// Calculate visible bounds in world coordinates
	const visibleBounds = $derived.by(() => {
		// Convert viewport corners to world coordinates
		const topLeft = viewport.screenToWorld(0, 0);
		const bottomRight = viewport.screenToWorld(viewportWidth, viewportHeight);

		return {
			minX: topLeft.x,
			minY: topLeft.y,
			maxX: bottomRight.x,
			maxY: bottomRight.y,
			width: bottomRight.x - topLeft.x,
			height: bottomRight.y - topLeft.y
		};
	});

	// Adaptive grid spacing - adjust detail level based on zoom
	const adaptiveGrid = $derived.by(() => {
		const zoom = viewport.zoom;
		const baseSpacing = grid.gridSpacingPixels;
		const majorSpacing = grid.majorGridSpacingPixels;

		// Calculate how many pixels a grid line spans on screen
		const screenSpacing = baseSpacing * zoom;
		const majorScreenSpacing = majorSpacing * zoom;

		// Minimum spacing on screen (in pixels) before we need to skip lines
		const MIN_SCREEN_SPACING = 15; // Show lines at least 15px apart

		// Calculate grid level based on zoom
		// At high zoom: show every line (level 1)
		// At medium zoom: show every 2nd line (level 2)
		// At low zoom: show every 5th line (level 5)
		// At very low zoom: show every 10th line (level 10)
		let minorLevel = 1;
		let majorLevel = 1;

		// For minor lines
		if (screenSpacing < MIN_SCREEN_SPACING) {
			// Calculate what multiple we need to show
			const targetMultiple = Math.ceil(MIN_SCREEN_SPACING / screenSpacing);
			// Round to nice numbers: 1, 2, 5, 10, 20, 50, 100, etc.
			if (targetMultiple <= 2) {
				minorLevel = 2;
			} else if (targetMultiple <= 5) {
				minorLevel = 5;
			} else if (targetMultiple <= 10) {
				minorLevel = 10;
			} else if (targetMultiple <= 20) {
				minorLevel = 20;
			} else if (targetMultiple <= 50) {
				minorLevel = 50;
			} else {
				minorLevel = 100;
			}
		}

		// For major lines, use similar logic but with higher threshold
		if (majorScreenSpacing < MIN_SCREEN_SPACING) {
			const targetMultiple = Math.ceil(MIN_SCREEN_SPACING / majorScreenSpacing);
			if (targetMultiple <= 2) {
				majorLevel = 2;
			} else if (targetMultiple <= 5) {
				majorLevel = 5;
			} else if (targetMultiple <= 10) {
				majorLevel = 10;
			} else {
				majorLevel = 20;
			}
		}

		const effectiveMinorSpacing = baseSpacing * minorLevel;
		const effectiveMajorSpacing = majorSpacing * majorLevel;

		// Show minor lines only if they won't overlap with major lines
		const showMinorLines =
			minorLevel < majorLevel ||
			(effectiveMinorSpacing !== effectiveMajorSpacing && screenSpacing * minorLevel >= 8);
		const showMajorLines = true; // Always show major lines (but spaced appropriately)

		return {
			showMinorLines,
			showMajorLines,
			minorSpacing: effectiveMinorSpacing,
			majorSpacing: effectiveMajorSpacing,
			minorLevel,
			majorLevel,
			screenMinorSpacing: effectiveMinorSpacing * zoom,
			screenMajorSpacing: effectiveMajorSpacing * zoom
		};
	});

	// Generate minor grid lines (lighter)
	const minorGridLines = $derived.by(() => {
		if (!grid.showGrid || !adaptiveGrid.showMinorLines) return { horizontal: [], vertical: [] };

		const spacing = adaptiveGrid.minorSpacing;
		const majorSpacing = adaptiveGrid.majorSpacing;
		const { minX, minY, maxX, maxY } = visibleBounds;

		// Add padding to ensure we cover edges
		const padding = spacing * 2;
		const startX = Math.floor((minX - padding) / spacing) * spacing;
		const endX = Math.ceil((maxX + padding) / spacing) * spacing;
		const startY = Math.floor((minY - padding) / spacing) * spacing;
		const endY = Math.ceil((maxY + padding) / spacing) * spacing;

		const horizontal: number[] = [];
		const vertical: number[] = [];

		// Maximum line count to prevent performance issues
		const MAX_LINES = 200;

		// Generate vertical lines (exclude major lines)
		for (let x = startX; x <= endX; x += spacing) {
			if (vertical.length >= MAX_LINES) break;
			// Skip if this is a major line position
			if (Math.abs(x % majorSpacing) < 0.001) continue;
			vertical.push(x);
		}

		// Generate horizontal lines (exclude major lines)
		for (let y = startY; y <= endY; y += spacing) {
			if (horizontal.length >= MAX_LINES) break;
			// Skip if this is a major line position
			if (Math.abs(y % majorSpacing) < 0.001) continue;
			horizontal.push(y);
		}

		return { horizontal, vertical };
	});

	// Generate major grid lines (darker)
	const majorGridLines = $derived.by(() => {
		if (!grid.showGrid || !adaptiveGrid.showMajorLines) return { horizontal: [], vertical: [] };

		const spacing = adaptiveGrid.majorSpacing;
		const { minX, minY, maxX, maxY } = visibleBounds;

		// Add padding
		const padding = spacing * 2;
		const startX = Math.floor((minX - padding) / spacing) * spacing;
		const endX = Math.ceil((maxX + padding) / spacing) * spacing;
		const startY = Math.floor((minY - padding) / spacing) * spacing;
		const endY = Math.ceil((maxY + padding) / spacing) * spacing;

		const horizontal: number[] = [];
		const vertical: number[] = [];

		// Generate vertical lines (exclude center line at x=0)
		for (let x = startX; x <= endX; x += spacing) {
			if (Math.abs(x) < 0.001) continue; // Skip center line
			vertical.push(x);
		}

		// Generate horizontal lines (exclude plaster line at y=0)
		for (let y = startY; y <= endY; y += spacing) {
			if (Math.abs(y) < 0.001) continue; // Skip plaster line
			horizontal.push(y);
		}

		return { horizontal, vertical };
	});

	// Calculate extended bounds for reference lines (extend beyond visible area)
	const extendedBounds = $derived.by(() => {
		const { minX, minY, maxX, maxY } = visibleBounds;
		const extend = Math.max(maxX - minX, maxY - minY);
		return {
			minX: minX - extend,
			maxX: maxX + extend,
			minY: minY - extend,
			maxY: maxY + extend
		};
	});
</script>

<g class="grid-layer">
	<!-- Minor grid lines -->
	{#if grid.showGrid && adaptiveGrid.showMinorLines}
		<g class="minor-grid">
			<!-- Vertical minor lines -->
			{#each minorGridLines.vertical as x (x)}
				<line
					x1={x}
					y1={visibleBounds.minY - 1000}
					x2={x}
					y2={visibleBounds.maxY + 1000}
					class="grid-line minor"
				/>
			{/each}
			<!-- Horizontal minor lines -->
			{#each minorGridLines.horizontal as y (y)}
				<line
					x1={visibleBounds.minX - 1000}
					y1={y}
					x2={visibleBounds.maxX + 1000}
					y2={y}
					class="grid-line minor"
				/>
			{/each}
		</g>
	{/if}

	<!-- Major grid lines -->
	{#if grid.showGrid && adaptiveGrid.showMajorLines}
		<g class="major-grid">
			<!-- Vertical major lines -->
			{#each majorGridLines.vertical as x (x)}
				<line
					x1={x}
					y1={visibleBounds.minY - 1000}
					x2={x}
					y2={visibleBounds.maxY + 1000}
					class="grid-line major"
				/>
			{/each}
			<!-- Horizontal major lines -->
			{#each majorGridLines.horizontal as y (y)}
				<line
					x1={visibleBounds.minX - 1000}
					y1={y}
					x2={visibleBounds.maxX + 1000}
					y2={y}
					class="grid-line major"
				/>
			{/each}
		</g>
	{/if}

	<!-- Center line (vertical at x=0) - always visible if enabled -->
	{#if grid.showCenterLine}
		<line
			x1={0}
			y1={extendedBounds.minY}
			x2={0}
			y2={extendedBounds.maxY}
			class="reference-line center-line"
		/>
	{/if}

	<!-- Plaster line (horizontal at y=0) - always visible if enabled -->
	{#if grid.showPlasterLine}
		<line
			x1={extendedBounds.minX}
			y1={0}
			x2={extendedBounds.maxX}
			y2={0}
			class="reference-line plaster-line"
		/>
	{/if}

	<!-- Origin marker (intersection of center and plaster lines) -->
	{#if grid.showCenterLine && grid.showPlasterLine}
		<circle cx={0} cy={0} r={4} class="origin-marker" />
	{/if}
</g>

<style>
	/* Minor grid lines - subtle (Catppuccin surface0) */
	.grid-line.minor {
		stroke: #313244;
		stroke-width: 0.5;
		opacity: 0.4;
		vector-effect: non-scaling-stroke;
	}

	/* Major grid lines - more visible (Catppuccin surface1) */
	.grid-line.major {
		stroke: #45475a;
		stroke-width: 1;
		opacity: 0.6;
		vector-effect: non-scaling-stroke;
	}

	/* Center line - vertical at x=0 (Catppuccin green) */
	.reference-line.center-line {
		stroke: #a6e3a1;
		stroke-width: 1.5;
		opacity: 0.8;
		vector-effect: non-scaling-stroke;
	}

	/* Plaster line - horizontal at y=0 (Catppuccin pink) */
	.reference-line.plaster-line {
		stroke: #f5c2e7;
		stroke-width: 1.5;
		opacity: 0.8;
		vector-effect: non-scaling-stroke;
	}

	/* Origin marker (Catppuccin peach) */
	.origin-marker {
		fill: #fab387;
		stroke: #fab387;
		stroke-width: 2;
		opacity: 0.9;
		vector-effect: non-scaling-stroke;
	}
</style>
