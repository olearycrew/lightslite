<script lang="ts">
	/**
	 * Rectangle Component
	 *
	 * Renders a rectangle shape on the canvas.
	 * Supports fill, stroke, and rotation.
	 */
	import type { RectGeometry } from '$lib/types';
	import { viewport } from '$lib/stores/viewport.svelte';

	interface Props {
		/** Rectangle geometry */
		geometry: RectGeometry;
		/** Fill color */
		fill?: string;
		/** Stroke color */
		stroke?: string;
		/** Stroke width */
		strokeWidth?: number;
		/** Whether this rectangle is selected */
		isSelected?: boolean;
		/** Whether this rectangle is hovered */
		isHovered?: boolean;
	}

	let {
		geometry,
		fill = 'transparent',
		stroke = '#cdd6f4', // Catppuccin Mocha text color
		strokeWidth = 2,
		isSelected = false,
		isHovered = false
	}: Props = $props();

	// Scale stroke width with zoom for consistent appearance
	const scaledStrokeWidth = $derived(strokeWidth / viewport.zoom);

	// Calculate transform origin for rotation (center of rectangle)
	// Reserved for CSS transform-origin if needed in the future
	// const transformOrigin = $derived(
	// 	geometry.rotation
	// 		? `${geometry.x + geometry.width / 2}px ${geometry.y + geometry.height / 2}px`
	// 		: undefined
	// );

	// Transform string for rotation
	const transformStr = $derived(
		geometry.rotation
			? `rotate(${geometry.rotation} ${geometry.x + geometry.width / 2} ${geometry.y + geometry.height / 2})`
			: undefined
	);

	// Highlight stroke width
	const highlightStrokeWidth = $derived((strokeWidth + 4) / viewport.zoom);
</script>

<g
	class="shape-rectangle"
	class:selected={isSelected}
	class:hovered={isHovered}
	transform={transformStr}
>
	<!-- Invisible hit area for easier selection -->
	<rect
		class="hit-area"
		x={geometry.x - 5 / viewport.zoom}
		y={geometry.y - 5 / viewport.zoom}
		width={geometry.width + 10 / viewport.zoom}
		height={geometry.height + 10 / viewport.zoom}
	/>

	<!-- Hover/selection highlight -->
	{#if isSelected || isHovered}
		<rect
			class="highlight"
			class:selected={isSelected}
			class:hovered={isHovered && !isSelected}
			x={geometry.x - 2 / viewport.zoom}
			y={geometry.y - 2 / viewport.zoom}
			width={geometry.width + 4 / viewport.zoom}
			height={geometry.height + 4 / viewport.zoom}
			stroke-width={highlightStrokeWidth}
		/>
	{/if}

	<!-- Main rectangle -->
	<rect
		class="main-rect"
		x={geometry.x}
		y={geometry.y}
		width={geometry.width}
		height={geometry.height}
		{fill}
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

	.main-rect {
		pointer-events: none;
	}
</style>
