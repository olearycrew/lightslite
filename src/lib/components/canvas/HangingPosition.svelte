<script lang="ts">
	/**
	 * HangingPosition Component
	 *
	 * Renders a hanging position (electric, truss, ladder, boom, etc.) on the canvas.
	 * Shows position name label and can display instrument attachment points.
	 */
	import type { HangingPositionObject, HangingPositionType } from '$lib/stores/project.svelte';
	import { viewport } from '$lib/stores/viewport.svelte';
	import { grid } from '$lib/stores/grid.svelte';

	interface Props {
		/** Hanging position data */
		position: HangingPositionObject;
		/** Whether this position is selected */
		isSelected?: boolean;
		/** Whether this position is hovered */
		isHovered?: boolean;
	}

	let { position, isSelected = false, isHovered = false }: Props = $props();

	// Scale factors based on zoom
	const strokeWidth = $derived(4 / viewport.zoom);
	const endCapRadius = $derived(6 / viewport.zoom);
	const fontSize = $derived(11 / viewport.zoom);
	const labelPadding = $derived(4 / viewport.zoom);

	// Highlight stroke width
	const highlightStrokeWidth = $derived(8 / viewport.zoom);

	// Colors based on position type
	const typeColors: Record<HangingPositionType, { stroke: string; fill: string }> = {
		electric: { stroke: '#f5a742', fill: '#f5a742' },
		truss: { stroke: '#8b4513', fill: '#d2691e' },
		ladder: { stroke: '#4682b4', fill: '#4682b4' },
		boom: { stroke: '#228b22', fill: '#228b22' },
		'box-boom': { stroke: '#6b238e', fill: '#6b238e' },
		'ground-row': { stroke: '#dc143c', fill: '#dc143c' }
	};

	const colors = $derived(typeColors[position.positionType]);

	// Calculate midpoint for label placement
	const midX = $derived((position.x1 + position.x2) / 2 + (position.labelOffsetX ?? 0));
	const midY = $derived((position.y1 + position.y2) / 2 + (position.labelOffsetY ?? -20));

	// Calculate length in display units
	const lengthPixels = $derived(
		Math.sqrt(Math.pow(position.x2 - position.x1, 2) + Math.pow(position.y2 - position.y1, 2))
	);
	const lengthUnits = $derived(lengthPixels / grid.pixelsPerUnit);
	const unitLabel = $derived(grid.unit === 'feet' ? "'" : 'm');

	// Trim height display
	const trimLabel = $derived(
		position.trimHeight !== undefined ? ` @ ${position.trimHeight}${unitLabel}` : ''
	);

	// Calculate the angle for boom orientation
	const angle = $derived(
		Math.atan2(position.y2 - position.y1, position.x2 - position.x1) * (180 / Math.PI)
	);

	// For booms: calculate base circle position
	const isVertical = $derived(
		position.positionType === 'boom' || position.positionType === 'ladder'
	);
</script>

<g
	class="hanging-position"
	class:selected={isSelected}
	class:hovered={isHovered}
	data-position-type={position.positionType}
>
	<!-- Invisible hit area for easier selection -->
	<line
		class="hit-area"
		x1={position.x1}
		y1={position.y1}
		x2={position.x2}
		y2={position.y2}
		stroke-width={Math.max(20 / viewport.zoom, strokeWidth * 4)}
	/>

	<!-- Hover/selection highlight -->
	{#if isSelected || isHovered}
		<line
			class="highlight"
			class:selected={isSelected}
			class:hovered={isHovered && !isSelected}
			x1={position.x1}
			y1={position.y1}
			x2={position.x2}
			y2={position.y2}
			stroke-width={highlightStrokeWidth}
		/>
	{/if}

	<!-- Main line -->
	<line
		class="main-line"
		x1={position.x1}
		y1={position.y1}
		x2={position.x2}
		y2={position.y2}
		stroke={colors.stroke}
		stroke-width={strokeWidth}
		stroke-linecap="round"
	/>

	<!-- End caps based on type -->
	{#if position.positionType === 'electric' || position.positionType === 'truss'}
		<!-- Electric/Truss: circles at ends -->
		<circle class="end-cap" cx={position.x1} cy={position.y1} r={endCapRadius} fill={colors.fill} />
		<circle class="end-cap" cx={position.x2} cy={position.y2} r={endCapRadius} fill={colors.fill} />
	{:else if position.positionType === 'boom' || position.positionType === 'box-boom'}
		<!-- Boom: base plate at start, small circle at top -->
		<rect
			class="boom-base"
			x={position.x1 - endCapRadius}
			y={position.y1 - endCapRadius}
			width={endCapRadius * 2}
			height={endCapRadius * 2}
			fill={colors.fill}
		/>
		<circle
			class="end-cap"
			cx={position.x2}
			cy={position.y2}
			r={endCapRadius * 0.6}
			fill={colors.fill}
		/>
	{:else if position.positionType === 'ladder'}
		<!-- Ladder: rectangle at both ends -->
		<rect
			class="ladder-end"
			x={position.x1 - endCapRadius}
			y={position.y1 - endCapRadius * 0.5}
			width={endCapRadius * 2}
			height={endCapRadius}
			fill={colors.fill}
		/>
		<rect
			class="ladder-end"
			x={position.x2 - endCapRadius}
			y={position.y2 - endCapRadius * 0.5}
			width={endCapRadius * 2}
			height={endCapRadius}
			fill={colors.fill}
		/>
	{:else if position.positionType === 'ground-row'}
		<!-- Ground row: small triangles at ends -->
		<polygon
			class="ground-row-end"
			points="{position.x1},{position.y1 - endCapRadius} {position.x1 - endCapRadius},{position.y1 +
				endCapRadius} {position.x1 + endCapRadius},{position.y1 + endCapRadius}"
			fill={colors.fill}
		/>
		<polygon
			class="ground-row-end"
			points="{position.x2},{position.y2 - endCapRadius} {position.x2 - endCapRadius},{position.y2 +
				endCapRadius} {position.x2 + endCapRadius},{position.y2 + endCapRadius}"
			fill={colors.fill}
		/>
	{/if}

	<!-- Label -->
	{#if position.visible}
		<g class="label-group" transform="translate({midX}, {midY})">
			<rect
				class="label-background"
				x={-50 / viewport.zoom}
				y={-8 / viewport.zoom}
				width={100 / viewport.zoom}
				height={16 / viewport.zoom}
				rx={3 / viewport.zoom}
			/>
			<text
				class="label-text"
				text-anchor="middle"
				dominant-baseline="central"
				font-size={fontSize}
			>
				{position.name}{trimLabel}
			</text>
		</g>
	{/if}
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
		stroke: rgba(0, 0, 0, 0.3);
	}

	.main-line {
		pointer-events: none;
	}

	.end-cap,
	.boom-base,
	.ladder-end,
	.ground-row-end {
		pointer-events: none;
	}

	.label-background {
		fill: rgba(255, 255, 255, 0.9);
		stroke: rgba(0, 0, 0, 0.2);
		stroke-width: 0.5;
	}

	.label-text {
		fill: #333333;
		font-family: system-ui, sans-serif;
		font-weight: 500;
		pointer-events: none;
	}

	.hanging-position.selected .label-background {
		fill: rgba(66, 135, 245, 0.1);
		stroke: #4287f5;
	}
</style>
