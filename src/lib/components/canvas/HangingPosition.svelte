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
		/** Callback when resize handle is dragged (end: 'start' | 'end', deltaX: number, deltaY: number) */
		onresize?: (end: 'start' | 'end', deltaX: number, deltaY: number) => void;
	}

	let { position, isSelected = false, isHovered = false, onresize }: Props = $props();

	// Resize handle state
	let isResizingStart = $state(false);
	let isResizingEnd = $state(false);
	let resizeStartX = $state(0);
	let resizeStartY = $state(0);

	// Scale factors based on zoom
	const strokeWidth = $derived(4 / viewport.zoom);
	const endCapRadius = $derived(6 / viewport.zoom);
	const fontSize = $derived(11 / viewport.zoom);
	// Label padding reserved for future use
	// const labelPadding = $derived(4 / viewport.zoom);

	// Highlight stroke width
	const highlightStrokeWidth = $derived(8 / viewport.zoom);

	// Colors based on position type (Catppuccin Mocha palette)
	const typeColors: Record<HangingPositionType, { stroke: string; fill: string }> = {
		electric: { stroke: '#fab387', fill: '#fab387' }, // peach
		truss: { stroke: '#eba0ac', fill: '#eba0ac' }, // maroon
		ladder: { stroke: '#89b4fa', fill: '#89b4fa' }, // blue
		boom: { stroke: '#a6e3a1', fill: '#a6e3a1' }, // green
		'box-boom': { stroke: '#cba6f7', fill: '#cba6f7' }, // mauve
		'ground-row': { stroke: '#f38ba8', fill: '#f38ba8' } // red
	};

	const colors = $derived(typeColors[position.positionType]);

	// Default label position offset based on position type
	const defaultLabelOffset = $derived.by(() => {
		const labelPos = position.labelPosition ?? 'left';
		switch (labelPos) {
			case 'left':
				return { x: -60, y: 0 };
			case 'right':
				return { x: 60, y: 0 };
			case 'above':
				return { x: 0, y: -30 };
			case 'below':
				return { x: 0, y: 30 };
			default:
				return { x: -60, y: 0 };
		}
	});

	// Calculate midpoint for label placement
	const midX = $derived(
		(position.x1 + position.x2) / 2 + defaultLabelOffset.x + (position.labelOffsetX ?? 0)
	);
	const midY = $derived(
		(position.y1 + position.y2) / 2 + defaultLabelOffset.y + (position.labelOffsetY ?? 0)
	);

	// Calculate length in display units (reserved for future dimension display)
	// const lengthPixels = $derived(
	// 	Math.sqrt(Math.pow(position.x2 - position.x1, 2) + Math.pow(position.y2 - position.y1, 2))
	// );
	// const lengthUnits = $derived(lengthPixels / grid.pixelsPerUnit);
	const unitLabel = $derived(grid.unit === 'feet' ? "'" : 'm');

	// Trim height display
	const trimLabel = $derived(
		position.trimHeight !== undefined ? ` @ ${position.trimHeight}${unitLabel}` : ''
	);

	// Calculate the angle for boom orientation (reserved for future rotation)
	// const angle = $derived(
	// 	Math.atan2(position.y2 - position.y1, position.x2 - position.x1) * (180 / Math.PI)
	// );

	// For booms: calculate base circle position (reserved for future use)
	// const isVertical = $derived(
	// 	position.positionType === 'boom' || position.positionType === 'ladder'
	// );

	// Resize handle functions
	function handleResizeStartMouseDown(event: MouseEvent) {
		if (!onresize || position.locked) return;
		event.stopPropagation();
		isResizingStart = true;
		const worldCoords = viewport.screenToWorld(event.clientX, event.clientY);
		resizeStartX = worldCoords.x;
		resizeStartY = worldCoords.y;
		window.addEventListener('mousemove', handleResizeStartMove);
		window.addEventListener('mouseup', handleResizeStartUp);
	}

	function handleResizeStartMove(event: MouseEvent) {
		if (!isResizingStart || !onresize) return;
		const worldCoords = viewport.screenToWorld(event.clientX, event.clientY);
		const deltaX = worldCoords.x - resizeStartX;
		const deltaY = worldCoords.y - resizeStartY;
		onresize('start', deltaX, deltaY);
	}

	function handleResizeStartUp() {
		isResizingStart = false;
		window.removeEventListener('mousemove', handleResizeStartMove);
		window.removeEventListener('mouseup', handleResizeStartUp);
	}

	function handleResizeEndMouseDown(event: MouseEvent) {
		if (!onresize || position.locked) return;
		event.stopPropagation();
		isResizingEnd = true;
		const worldCoords = viewport.screenToWorld(event.clientX, event.clientY);
		resizeStartX = worldCoords.x;
		resizeStartY = worldCoords.y;
		window.addEventListener('mousemove', handleResizeEndMove);
		window.addEventListener('mouseup', handleResizeEndUp);
	}

	function handleResizeEndMove(event: MouseEvent) {
		if (!isResizingEnd || !onresize) return;
		const worldCoords = viewport.screenToWorld(event.clientX, event.clientY);
		const deltaX = worldCoords.x - resizeStartX;
		const deltaY = worldCoords.y - resizeStartY;
		onresize('end', deltaX, deltaY);
	}

	function handleResizeEndUp() {
		isResizingEnd = false;
		window.removeEventListener('mousemove', handleResizeEndMove);
		window.removeEventListener('mouseup', handleResizeEndUp);
	}

	// Resize handle size
	const resizeHandleSize = $derived(10 / viewport.zoom);
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

	<!-- Resize handles (visible when selected) -->
	{#if isSelected && onresize}
		<!-- Start resize handle -->
		<circle
			class="resize-handle start-handle"
			class:active={isResizingStart}
			cx={position.x1}
			cy={position.y1}
			r={resizeHandleSize}
			onmousedown={handleResizeStartMouseDown}
		/>
		<!-- End resize handle -->
		<circle
			class="resize-handle end-handle"
			class:active={isResizingEnd}
			cx={position.x2}
			cy={position.y2}
			r={resizeHandleSize}
			onmousedown={handleResizeEndMouseDown}
		/>
	{/if}

	<!-- Label -->
	<!-- Note: scale(1, -1) counter-flips the label since the viewport Y axis is flipped -->
	{#if position.visible}
		<g
			class="label-group"
			transform="translate({midX + (position.labelOffsetX ?? 0)}, {midY +
				(position.labelOffsetY ?? 0)}) scale(1, -1)"
		>
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
		stroke: #89b4fa; /* Catppuccin Mocha blue */
	}

	.highlight.hovered {
		stroke: rgba(147, 153, 178, 0.5); /* Catppuccin overlay2 */
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
		fill: rgba(49, 50, 68, 0.95); /* Catppuccin surface0 */
		stroke: rgba(69, 71, 90, 0.8); /* Catppuccin surface1 */
		stroke-width: 0.5;
	}

	.label-text {
		fill: #cdd6f4; /* Catppuccin text */
		font-family: system-ui, sans-serif;
		font-weight: 500;
		pointer-events: none;
	}

	.hanging-position.selected .label-background {
		fill: rgba(137, 180, 250, 0.15); /* Catppuccin blue bg */
		stroke: #89b4fa; /* Catppuccin blue */
	}

	.resize-handle {
		fill: #ffffff;
		stroke: #89b4fa;
		stroke-width: 2px;
		cursor: grab;
		pointer-events: all;
	}

	.resize-handle:hover,
	.resize-handle.active {
		fill: #89b4fa;
		cursor: grabbing;
	}
</style>
