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
		/** Custom label to display (channel number, etc.) */
		channelLabel?: string | number | null;
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
		channelLabel = null
	}: Props = $props();

	// Get the symbol definition for this instrument type
	const symbol = $derived(getSymbol(type));

	// Computed colors
	const fillColor = $derived(fill ?? symbol.defaultFill);
	const strokeColor = $derived(stroke ?? symbol.defaultStroke);

	// Stroke width that stays consistent regardless of zoom
	const baseStrokeWidth = $derived(1.5 / viewport.zoom);

	// Selection/hover outline width
	const highlightStrokeWidth = $derived(2 / viewport.zoom);

	// Font size for channel label
	const fontSize = $derived(10 / viewport.zoom);

	// Transform string for positioning
	const transform = $derived(`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`);

	// Calculate bounding box for highlight
	const halfWidth = $derived((symbol.width * scale) / 2);
	const halfHeight = $derived((symbol.height * scale) / 2);

	// Front indicator position (arrow showing beam direction)
	const frontIndicatorY = $derived(symbol.frontIndicator?.y ?? -(symbol.height / 2 + 6));
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
		{#each symbol.detailPaths as detailPath}
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

	<!-- Front direction indicator -->
	{#if symbol.showFrontIndicator}
		<g class="front-indicator" transform="translate(0, {frontIndicatorY})">
			<!-- Small triangle pointing in the beam direction -->
			<polygon
				points="0,-4 -3,2 3,2"
				fill={strokeColor}
				stroke="none"
				transform="scale({1 / viewport.zoom})"
			/>
		</g>
	{/if}

	<!-- Channel number label (shown inside or near the symbol) -->
	{#if channelLabel !== null && channelLabel !== undefined}
		<text
			class="channel-label"
			x={0}
			y={2 / viewport.zoom}
			text-anchor="middle"
			dominant-baseline="middle"
			font-size={fontSize}
			fill={strokeColor}
			font-weight="bold"
		>
			{channelLabel}
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

	.front-indicator {
		pointer-events: none;
	}

	.channel-label {
		pointer-events: none;
		font-family: system-ui, sans-serif;
		user-select: none;
	}
</style>
