<script lang="ts">
	/**
	 * StageLayer Component
	 *
	 * Renders the stage/venue boundary visualization:
	 * - Stage bounds rectangle (shaded area)
	 * - Proscenium arch (if configured)
	 *
	 * This layer is rendered behind other content but above the grid,
	 * providing visual context for the stage space.
	 */
	import { project } from '$lib/stores/project.svelte';
	import { grid } from '$lib/stores/grid.svelte';
	import { viewport } from '$lib/stores/viewport.svelte';

	// Get stage bounds from venue config
	const stageBounds = $derived(project.venue.stageBounds);
	const showStageBounds = $derived(project.venue.showStageBounds);
	const prosceniumWidth = $derived(project.venue.prosceniumWidth);

	// Convert proscenium width from feet to pixels (height is not used in 2D plan view)
	const prosceniumWidthPx = $derived(
		prosceniumWidth !== null ? prosceniumWidth * grid.pixelsPerUnit : null
	);

	// Calculate proscenium line position (at the plaster line)
	const prosceniumY = $derived(project.venue.plasterLine);
	const centerX = $derived(project.venue.centerLine);

	// Extended bounds for proscenium arch visualization
	const visibleBounds = $derived.by(() => {
		const topLeft = viewport.screenToWorld(0, 0);
		const bottomRight = viewport.screenToWorld(1920, 1080); // Approximate viewport size
		return {
			minX: topLeft.x - 2000,
			maxX: bottomRight.x + 2000,
			minY: topLeft.y - 2000,
			maxY: bottomRight.y + 2000
		};
	});
</script>

<g class="stage-layer">
	<!-- Stage bounds rectangle -->
	{#if stageBounds && showStageBounds}
		<rect
			x={stageBounds.x}
			y={stageBounds.y}
			width={stageBounds.width}
			height={stageBounds.height}
			class="stage-bounds"
		/>
		<!-- Stage bounds outline -->
		<rect
			x={stageBounds.x}
			y={stageBounds.y}
			width={stageBounds.width}
			height={stageBounds.height}
			class="stage-bounds-outline"
		/>
	{/if}

	<!-- Proscenium opening (rendered as a highlighted rectangle at the plaster line) -->
	{#if prosceniumWidthPx !== null && showStageBounds}
		<line
			x1={centerX - prosceniumWidthPx / 2}
			y1={prosceniumY}
			x2={centerX + prosceniumWidthPx / 2}
			y2={prosceniumY}
			class="proscenium-opening"
		/>
		<!-- Proscenium edge markers -->
		<g class="proscenium-markers">
			<!-- Left edge marker -->
			<line
				x1={centerX - prosceniumWidthPx / 2}
				y1={prosceniumY - 10}
				x2={centerX - prosceniumWidthPx / 2}
				y2={prosceniumY + 10}
				class="proscenium-edge"
			/>
			<!-- Right edge marker -->
			<line
				x1={centerX + prosceniumWidthPx / 2}
				y1={prosceniumY - 10}
				x2={centerX + prosceniumWidthPx / 2}
				y2={prosceniumY + 10}
				class="proscenium-edge"
			/>
		</g>

		<!-- Wing masking areas (outside proscenium) -->
		<rect
			x={visibleBounds.minX}
			y={prosceniumY}
			width={centerX - prosceniumWidthPx / 2 - visibleBounds.minX}
			height={visibleBounds.maxY - prosceniumY}
			class="wing-mask"
		/>
		<rect
			x={centerX + prosceniumWidthPx / 2}
			y={prosceniumY}
			width={visibleBounds.maxX - (centerX + prosceniumWidthPx / 2)}
			height={visibleBounds.maxY - prosceniumY}
			class="wing-mask"
		/>
	{/if}
</g>

<style>
	/* Stage bounds fill - subtle indication of stage area */
	.stage-bounds {
		fill: rgba(166, 227, 161, 0.05); /* Catppuccin green with very low opacity */
		pointer-events: none;
	}

	/* Stage bounds outline - dashed line */
	.stage-bounds-outline {
		fill: none;
		stroke: #a6e3a1; /* Catppuccin green */
		stroke-width: 1;
		stroke-dasharray: 8 4;
		opacity: 0.5;
		vector-effect: non-scaling-stroke;
		pointer-events: none;
	}

	/* Proscenium opening line - solid at plaster line */
	.proscenium-opening {
		stroke: #f5c2e7; /* Catppuccin pink - same as plaster line */
		stroke-width: 3;
		opacity: 0.9;
		vector-effect: non-scaling-stroke;
		pointer-events: none;
	}

	/* Proscenium edge markers */
	.proscenium-edge {
		stroke: #f5c2e7;
		stroke-width: 2;
		opacity: 0.9;
		vector-effect: non-scaling-stroke;
		pointer-events: none;
	}

	/* Wing masking areas - darker to indicate off-stage */
	.wing-mask {
		fill: rgba(30, 30, 46, 0.3); /* Catppuccin base with opacity */
		pointer-events: none;
	}
</style>
