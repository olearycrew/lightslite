<script lang="ts">
	/**
	 * InstrumentSymbol Component
	 *
	 * Renders a lighting instrument symbol on the canvas.
	 * Handles position, rotation, scale, and visual states (selected, hovered).
	 * Uses SVG paths from the symbol library.
	 */
	import { viewport } from '$lib/stores/viewport.svelte';
	import { getSymbol } from '$lib/symbols';
	import type { InstrumentType } from '$lib/types/instrument';

	interface Props {
		/** Instrument type to render */
		type: InstrumentType;
		/** World X position */
		x: number;
		/** World Y position */
		y: number;
		/** Rotation in degrees (0 = pointing up/upstage) */
		rotation?: number;
		/** Scale factor (1.0 = normal) */
		scale?: number;
		/** Fill color override (uses symbol default if not provided) */
		fill?: string;
		/** Stroke color override */
		stroke?: string;
		/** Whether the instrument is selected */
		isSelected?: boolean;
		/** Whether the instrument is hovered */
		isHovered?: boolean;
		/** Custom label to display (unit number shown inside symbol) */
		unitLabel?: string | number | null;
	}

	let {
		type,
		x,
		y,
		rotation = 0,
		scale = 1,
		fill,
		stroke,
		isSelected = false,
		isHovered = false,
		unitLabel = null
	}: Props = $props();

	// Get the symbol definition for this instrument type
	const symbol = $derived(getSymbol(type));

	// Check if this is a moving light (needs dashed pan/tilt circle)
	const isMovingLight = $derived(type.startsWith('moving-'));

	// Computed colors
	const fillColor = $derived(fill ?? symbol.defaultFill);
	const strokeColor = $derived(stroke ?? symbol.defaultStroke);

	// Stroke width that stays consistent regardless of zoom
	const baseStrokeWidth = $derived(1.5 / viewport.zoom);

	// Selection/hover outline width
	const highlightStrokeWidth = $derived(2 / viewport.zoom);

	// Font size for unit label
	const fontSize = $derived(10 / viewport.zoom);

	// Transform string for positioning
	const transform = $derived(`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`);

	// Calculate bounding box for highlight
	const halfWidth = $derived((symbol.width * scale) / 2);
	const halfHeight = $derived((symbol.height * scale) / 2);

	// Dashed circle radius for moving lights (pan/tilt range indicator)
	const movingLightCircleRadius = $derived(24 * scale);
	const dashArray = $derived(`${4 / viewport.zoom} ${3 / viewport.zoom}`);
</script>

<g class="instrument-symbol" {transform} data-type={type}>
	<!-- Hover/Selection highlight (rendered first, behind everything) -->
	{#if isSelected || isHovered}
		<rect
			class="highlight"
			class:selected={isSelected}
			class:hovered={isHovered && !isSelected}
			x={-halfWidth - 4 / viewport.zoom}
			y={-halfHeight - 4 / viewport.zoom}
			width={symbol.width * scale + 8 / viewport.zoom}
			height={symbol.height * scale + 8 / viewport.zoom}
			rx={4 / viewport.zoom}
			stroke-width={highlightStrokeWidth}
		/>
	{/if}

	<!-- Dashed pan/tilt range circle for moving lights (rendered behind the fixture) -->
	{#if isMovingLight}
		<circle
			class="pan-tilt-range"
			cx={0}
			cy={0}
			r={movingLightCircleRadius}
			fill="none"
			stroke={strokeColor}
			stroke-width={baseStrokeWidth * 0.6}
			stroke-dasharray={dashArray}
			vector-effect="non-scaling-stroke"
		/>
	{/if}

	<!-- Main symbol body -->
	<path
		class="symbol-body"
		d={symbol.path}
		fill={fillColor}
		stroke={strokeColor}
		stroke-width={baseStrokeWidth}
		vector-effect="non-scaling-stroke"
	/>

	<!-- Detail paths (internal lines, patterns, etc.) -->
	{#if symbol.detailPaths}
		{#each symbol.detailPaths as detailPath, i (i)}
			<path
				class="symbol-detail"
				d={detailPath}
				fill="none"
				stroke={strokeColor}
				stroke-width={baseStrokeWidth * 0.75}
				vector-effect="non-scaling-stroke"
			/>
		{/each}
	{/if}

	<!-- Unit number label (shown inside the symbol body) -->
	<!-- Note: scale(1, -1) counter-flips the text since the viewport Y axis is flipped -->
	{#if unitLabel !== null && unitLabel !== undefined}
		<text
			class="unit-label"
			x={0}
			y={2 / viewport.zoom}
			text-anchor="middle"
			dominant-baseline="middle"
			font-size={fontSize}
			fill={strokeColor}
			font-weight="bold"
			transform="scale(1, -1)"
		>
			{unitLabel}
		</text>
	{/if}
</g>

<style>
	.instrument-symbol {
		cursor: pointer;
	}

	.symbol-body {
		transition: fill 0.15s ease;
	}

	.symbol-detail {
		pointer-events: none;
	}

	.highlight {
		fill: none;
		pointer-events: none;
	}

	.highlight.selected {
		stroke: #4287f5;
		fill: rgba(66, 135, 245, 0.1);
	}

	.highlight.hovered {
		stroke: rgba(0, 0, 0, 0.4);
		stroke-dasharray: 4 2;
	}

	.pan-tilt-range {
		pointer-events: none;
		opacity: 0.6;
	}

	.unit-label {
		pointer-events: none;
		font-family: system-ui, sans-serif;
		user-select: none;
	}
</style>
