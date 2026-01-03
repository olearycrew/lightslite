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

		// Determine which grid levels to show based on screen density
		// If lines would be too close together, skip minor lines
		const showMinorLines = screenSpacing >= 8; // Minimum 8px between minor lines
		const showMajorLines = majorScreenSpacing >= 20; // Show major even when dense

		// If both would be too dense, increase the effective spacing
		let effectiveMinorSpacing = baseSpacing;
		let effectiveMajorSpacing = majorSpacing;

		// Scale up spacing if too dense
		if (screenSpacing < 8) {
			const scaleFactor = Math.ceil(8 / screenSpacing);
			effectiveMinorSpacing = baseSpacing * scaleFactor;
		}

		if (majorScreenSpacing < 20) {
			const scaleFactor = Math.ceil(20 / majorScreenSpacing);
			effectiveMajorSpacing = majorSpacing * scaleFactor;
		}

		return {
			showMinorLines,
			showMajorLines,
			minorSpacing: effectiveMinorSpacing,
			majorSpacing: effectiveMajorSpacing,
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

		// Generate vertical lines (exclude major lines)
		for (let x = startX; x <= endX; x += spacing) {
			// Skip if this is a major line position
			if (Math.abs(x % majorSpacing) < 0.001) continue;
			vertical.push(x);
		}

		// Generate horizontal lines (exclude major lines)
		for (let y = startY; y <= endY; y += spacing) {
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
	/* Minor grid lines - subtle */
	.grid-line.minor {
		stroke: var(--color-border, #333);
		stroke-width: 0.5;
		opacity: 0.3;
		vector-effect: non-scaling-stroke;
	}

	/* Major grid lines - more visible */
	.grid-line.major {
		stroke: var(--color-border, #444);
		stroke-width: 1;
		opacity: 0.5;
		vector-effect: non-scaling-stroke;
	}

	/* Center line - vertical at x=0 (green) */
	.reference-line.center-line {
		stroke: #22c55e;
		stroke-width: 1.5;
		opacity: 0.8;
		vector-effect: non-scaling-stroke;
	}

	/* Plaster line - horizontal at y=0 (magenta) */
	.reference-line.plaster-line {
		stroke: #ec4899;
		stroke-width: 1.5;
		opacity: 0.8;
		vector-effect: non-scaling-stroke;
	}

	/* Origin marker */
	.origin-marker {
		fill: #f59e0b;
		stroke: #f59e0b;
		stroke-width: 2;
		opacity: 0.9;
		vector-effect: non-scaling-stroke;
	}
</style>
