<script lang="ts">
	/**
	 * Circle Component
	 *
	 * Renders a circle shape on the canvas.
	 * Supports fill and stroke styling.
	 */
	import type { CircleGeometry } from '$lib/types';
	import { viewport } from '$lib/stores/viewport.svelte';

	interface Props {
		/** Circle geometry */
		geometry: CircleGeometry;
		/** Fill color */
		fill?: string;
		/** Fill opacity (0-1) */
		fillOpacity?: number;
		/** Stroke color */
		stroke?: string;
		/** Stroke width */
		strokeWidth?: number;
		/** Whether this circle is selected */
		isSelected?: boolean;
		/** Whether this circle is hovered */
		isHovered?: boolean;
	}

	let {
		geometry,
		fill = 'transparent',
		fillOpacity = 1,
		stroke = '#cdd6f4', // Catppuccin Mocha text color
		strokeWidth = 2,
		isSelected = false,
		isHovered = false
	}: Props = $props();

	// Scale stroke width with zoom for consistent appearance
	const scaledStrokeWidth = $derived(strokeWidth / viewport.zoom);

	// Highlight stroke width
	const highlightStrokeWidth = $derived((strokeWidth + 4) / viewport.zoom);

	// Hit area radius (slightly larger for easier clicking)
	const hitAreaRadius = $derived(geometry.radius + 5 / viewport.zoom);
</script>

<g class="shape-circle" class:selected={isSelected} class:hovered={isHovered}>
	<!-- Invisible hit area for easier selection -->
	<circle class="hit-area" cx={geometry.cx} cy={geometry.cy} r={hitAreaRadius} />

	<!-- Hover/selection highlight -->
	{#if isSelected || isHovered}
		<circle
			class="highlight"
			class:selected={isSelected}
			class:hovered={isHovered && !isSelected}
			cx={geometry.cx}
			cy={geometry.cy}
			r={geometry.radius + 2 / viewport.zoom}
			stroke-width={highlightStrokeWidth}
		/>
	{/if}

	<!-- Main circle -->
	<circle
		class="main-circle"
		cx={geometry.cx}
		cy={geometry.cy}
		r={geometry.radius}
		{fill}
		fill-opacity={fillOpacity}
		{stroke}
		stroke-width={scaledStrokeWidth}
	/>
</g>

<style>
	.hit-area {
		fill: transparent;
		stroke: none;
		pointer-events: fill;
		cursor: pointer;
	}

	.highlight {
		fill: none;
		pointer-events: none;
	}

	.highlight.selected {
		stroke: #89b4fa; /* Catppuccin Mocha blue */
	}

	.highlight.hovered {
		stroke: #9399b2; /* Catppuccin Mocha overlay2 */
		stroke-dasharray: 4, 2;
	}

	.main-circle {
		pointer-events: none;
	}
</style>
