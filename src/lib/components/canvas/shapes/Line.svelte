<script lang="ts">
	/**
	 * Line Component
	 *
	 * Renders a line shape on the canvas.
	 * Integrates with SelectableObject for selection/drag support.
	 */
	import type { LineGeometry } from '$lib/types';
	import { viewport } from '$lib/stores/viewport.svelte';

	interface Props {
		/** Line geometry */
		geometry: LineGeometry;
		/** Stroke color */
		stroke?: string;
		/** Stroke width */
		strokeWidth?: number;
		/** Whether this line is selected */
		isSelected?: boolean;
		/** Whether this line is hovered */
		isHovered?: boolean;
	}

	let {
		geometry,
		stroke = '#000000',
		strokeWidth = 2,
		isSelected = false,
		isHovered = false
	}: Props = $props();

	// Scale stroke width with zoom for consistent appearance
	const scaledStrokeWidth = $derived(strokeWidth / viewport.zoom);

	// Hover/selection highlight stroke width
	const highlightStrokeWidth = $derived((strokeWidth + 4) / viewport.zoom);
</script>

<g class="shape-line" class:selected={isSelected} class:hovered={isHovered}>
	<!-- Invisible hit area for easier selection -->
	<line
		class="hit-area"
		x1={geometry.x1}
		y1={geometry.y1}
		x2={geometry.x2}
		y2={geometry.y2}
		stroke-width={Math.max(10 / viewport.zoom, scaledStrokeWidth * 3)}
	/>

	<!-- Hover/selection highlight -->
	{#if isSelected || isHovered}
		<line
			class="highlight"
			class:selected={isSelected}
			class:hovered={isHovered && !isSelected}
			x1={geometry.x1}
			y1={geometry.y1}
			x2={geometry.x2}
			y2={geometry.y2}
			stroke-width={highlightStrokeWidth}
		/>
	{/if}

	<!-- Main line -->
	<line
		class="main-line"
		x1={geometry.x1}
		y1={geometry.y1}
		x2={geometry.x2}
		y2={geometry.y2}
		{stroke}
		stroke-width={scaledStrokeWidth}
	/>
</g>

<style>
	.hit-area {
		stroke: transparent;
		fill: none;
		pointer-events: stroke;
		cursor: pointer;
	}

	.highlight {
		fill: none;
		pointer-events: none;
	}

	.highlight.selected {
		stroke: #4287f5;
	}

	.highlight.hovered {
		stroke: #999999;
		stroke-dasharray: 4, 2;
	}

	.main-line {
		fill: none;
		pointer-events: none;
	}
</style>
