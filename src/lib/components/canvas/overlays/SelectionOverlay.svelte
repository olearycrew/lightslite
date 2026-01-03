<script lang="ts">
	/**
	 * SelectionOverlay Component
	 *
	 * Renders selection-related visual elements:
	 * - Marquee selection rectangle during drag-select
	 * - Selection handles around selected objects
	 * - Bounding box for multi-selection
	 */
	import type { Bounds } from '$lib/stores/viewport.svelte';

	interface Props {
		/** Whether marquee selection is active */
		isMarqueeActive?: boolean;
		/** Marquee bounds in world coordinates */
		marqueeBounds?: Bounds | null;
		/** Bounding box of all selected objects in world coordinates */
		selectionBounds?: Bounds | null;
		/** Whether to show resize handles (single selection only) */
		showResizeHandles?: boolean;
		/** Whether to show rotation handle */
		showRotationHandle?: boolean;
		/** Zoom level for scaling handle sizes */
		zoom?: number;
	}

	let {
		isMarqueeActive = false,
		marqueeBounds = null,
		selectionBounds = null,
		showResizeHandles = false,
		showRotationHandle = false,
		zoom = 1
	}: Props = $props();

	// Handle size in screen pixels (will be scaled by inverse zoom)
	const HANDLE_SIZE = 8;
	const ROTATION_HANDLE_DISTANCE = 20;

	// Calculate handle size accounting for zoom (handles should appear constant size on screen)
	const handleSize = $derived(HANDLE_SIZE / zoom);
	const halfHandle = $derived(handleSize / 2);
	const rotationDistance = $derived(ROTATION_HANDLE_DISTANCE / zoom);

	// Calculate handle positions for selection bounds
	const handles = $derived.by(() => {
		if (!selectionBounds) return [];

		const { x, y, width, height } = selectionBounds;

		return [
			// Corner handles
			{ id: 'nw', x: x, y: y, cursor: 'nw-resize' },
			{ id: 'ne', x: x + width, y: y, cursor: 'ne-resize' },
			{ id: 'se', x: x + width, y: y + height, cursor: 'se-resize' },
			{ id: 'sw', x: x, y: y + height, cursor: 'sw-resize' },
			// Edge handles
			{ id: 'n', x: x + width / 2, y: y, cursor: 'n-resize' },
			{ id: 'e', x: x + width, y: y + height / 2, cursor: 'e-resize' },
			{ id: 's', x: x + width / 2, y: y + height, cursor: 's-resize' },
			{ id: 'w', x: x, y: y + height / 2, cursor: 'w-resize' }
		];
	});

	// Rotation handle position (above top center)
	const rotationHandle = $derived.by(() => {
		if (!selectionBounds) return null;
		return {
			x: selectionBounds.x + selectionBounds.width / 2,
			y: selectionBounds.y - rotationDistance
		};
	});
</script>

<g class="selection-overlay">
	<!-- Marquee selection rectangle -->
	{#if isMarqueeActive && marqueeBounds}
		<rect
			class="marquee-rect"
			x={marqueeBounds.x}
			y={marqueeBounds.y}
			width={marqueeBounds.width}
			height={marqueeBounds.height}
			stroke-width={1 / zoom}
		/>
	{/if}

	<!-- Selection bounding box -->
	{#if selectionBounds}
		<rect
			class="selection-box"
			x={selectionBounds.x}
			y={selectionBounds.y}
			width={selectionBounds.width}
			height={selectionBounds.height}
			stroke-width={1 / zoom}
		/>

		<!-- Resize handles -->
		{#if showResizeHandles}
			{#each handles as handle (handle.id)}
				<rect
					class="selection-handle"
					x={handle.x - halfHandle}
					y={handle.y - halfHandle}
					width={handleSize}
					height={handleSize}
					stroke-width={1 / zoom}
					data-handle-id={handle.id}
				/>
			{/each}
		{/if}

		<!-- Rotation handle -->
		{#if showRotationHandle && rotationHandle}
			<!-- Line connecting rotation handle to bounding box -->
			<line
				class="rotation-line"
				x1={selectionBounds.x + selectionBounds.width / 2}
				y1={selectionBounds.y}
				x2={rotationHandle.x}
				y2={rotationHandle.y}
				stroke-width={1 / zoom}
			/>
			<!-- Rotation handle circle -->
			<circle
				class="rotation-handle"
				cx={rotationHandle.x}
				cy={rotationHandle.y}
				r={halfHandle}
				stroke-width={1 / zoom}
			/>
		{/if}
	{/if}
</g>

<style>
	.marquee-rect {
		fill: rgba(66, 135, 245, 0.1);
		stroke: #4287f5;
		stroke-dasharray: 4, 4;
		pointer-events: none;
	}

	.selection-box {
		fill: none;
		stroke: #4287f5;
		pointer-events: none;
	}

	.selection-handle {
		fill: white;
		stroke: #4287f5;
		cursor: inherit;
	}

	.rotation-line {
		stroke: #4287f5;
		stroke-dasharray: 2, 2;
		pointer-events: none;
	}

	.rotation-handle {
		fill: white;
		stroke: #4287f5;
		cursor: grab;
	}
</style>
