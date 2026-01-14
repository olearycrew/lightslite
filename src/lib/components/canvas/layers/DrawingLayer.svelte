<script lang="ts">
	/**
	 * DrawingLayer Component
	 *
	 * Renders all shapes and objects from the project store.
	 * Organizes rendering by layer type for proper z-ordering.
	 * Respects layer visibility, lock state, and opacity from the layers store.
	 */
	import { project } from '$lib/stores/project.svelte';
	import { selection } from '$lib/stores/selection.svelte';
	import { layers } from '$lib/stores/derived/layers.svelte';
	import { history } from '$lib/stores/history.svelte';
	import { Line, Rectangle, Circle } from '../shapes';
	import HangingPosition from '../HangingPosition.svelte';
	import SelectableObject from '../SelectableObject.svelte';
	import InstrumentsLayer from './InstrumentsLayer.svelte';
	import type { LineGeometry, CircleGeometry } from '$lib/types';
	import { getGeometryBounds } from '$lib/types';
	import { createMoveHangingPositionCommand } from '$lib/stores/commands/hangingPosition';
	import type { HangingPositionObject } from '$lib/stores/project.svelte';

	// Local hover tracking for shapes
	let hoveredId = $state<string | null>(null);

	// Track drag state for creating commands
	let dragStartPositions = $state<Map<string, { x1: number; y1: number; x2: number; y2: number }>>(
		new Map()
	);

	// Get layer states for quick access
	const setPiecesLayer = $derived(layers.getById('layer-set-pieces'));
	const positionsLayer = $derived(layers.getById('layer-positions'));
	const stageLayer = $derived(layers.getById('layer-stage'));
	const annotationsLayer = $derived(layers.getById('layer-annotations'));
	const instrumentsLayer = $derived(layers.getById('layer-instruments'));

	/**
	 * Handle drag start for an object
	 */
	function handleDragStart(id: string) {
		const obj = project.getObject(id);
		if (obj && obj.objectType === 'hanging-position') {
			const position = obj as HangingPositionObject;
			dragStartPositions.set(id, {
				x1: position.x1,
				y1: position.y1,
				x2: position.x2,
				y2: position.y2
			});
		}
	}

	/**
	 * Handle drag for an object
	 */
	function handleDrag(id: string, deltaX: number, deltaY: number) {
		// If the dragged object is selected, move all selected objects
		if (selection.isSelected(id)) {
			project.moveObjects(selection.selectedIds, deltaX, deltaY);
		} else {
			// Otherwise just move this object
			project.moveObject(id, deltaX, deltaY);
		}
	}

	/**
	 * Handle drag end for an object
	 */
	function handleDragEnd(id: string) {
		const obj = project.getObject(id);
		if (obj && obj.objectType === 'hanging-position') {
			const position = obj as HangingPositionObject;
			const startPos = dragStartPositions.get(id);
			if (startPos) {
				// Create and execute command for the move
				const command = createMoveHangingPositionCommand(id, startPos, {
					x1: position.x1,
					y1: position.y1,
					x2: position.x2,
					y2: position.y2
				});
				history.executeCommand(command);
				dragStartPositions.delete(id);
			}
		}
	}

	/**
	 * Handle resize for a hanging position
	 * @unused Reserved for future interactive resize handles
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function handleResize(id: string, end: 'start' | 'end', deltaX: number, deltaY: number) {
		project.resizeHangingPosition(id, end, deltaX, deltaY);
	}

	// Hover handlers reserved for future interactive features
	// function handleMouseEnter(id: string) { hoveredId = id; }
	// function handleMouseLeave() { hoveredId = null; }
</script>

<g class="drawing-layer">
	<!-- Layer 1: Set Pieces (background) -->
	{#if setPiecesLayer?.visible}
		<g class="set-pieces-layer" style:opacity={setPiecesLayer?.opacity ?? 1}>
			{#each project.setPieces as setPiece (setPiece.id)}
				{#if setPiece.visible}
					{@const bounds = getGeometryBounds(setPiece.geometry)}
					{@const isLayerLocked = setPiecesLayer?.locked ?? false}
					<SelectableObject
						id={setPiece.id}
						type="set-piece"
						x={bounds.x}
						y={bounds.y}
						width={bounds.width}
						height={bounds.height}
						locked={setPiece.locked || isLayerLocked}
						visible={setPiece.visible}
						ondrag={(dx, dy) => handleDrag(setPiece.id, dx, dy)}
					>
						{#if setPiece.geometry.type === 'rect'}
							<Rectangle
								geometry={setPiece.geometry}
								fill={setPiece.fill}
								fillOpacity={setPiece.fillOpacity}
								stroke={setPiece.stroke}
								strokeWidth={setPiece.strokeWidth}
								isSelected={selection.isSelected(setPiece.id)}
								isHovered={hoveredId === setPiece.id}
							/>
						{:else if setPiece.geometry.type === 'circle'}
							<Circle
								geometry={setPiece.geometry as CircleGeometry}
								fill={setPiece.fill}
								fillOpacity={setPiece.fillOpacity}
								stroke={setPiece.stroke}
								strokeWidth={setPiece.strokeWidth}
								isSelected={selection.isSelected(setPiece.id)}
								isHovered={hoveredId === setPiece.id}
							/>
						{:else if setPiece.geometry.type === 'line'}
							<Line
								geometry={setPiece.geometry as LineGeometry}
								stroke={setPiece.stroke}
								strokeWidth={setPiece.strokeWidth}
								isSelected={selection.isSelected(setPiece.id)}
								isHovered={hoveredId === setPiece.id}
							/>
						{/if}
					</SelectableObject>
				{/if}
			{/each}
		</g>
	{/if}

	<!-- Layer 2: Hanging Positions -->
	{#if positionsLayer?.visible}
		<g class="hanging-positions-layer" style:opacity={positionsLayer?.opacity ?? 1}>
			{#each project.hangingPositions as position (position.id)}
				{#if position.visible}
					{@const bounds = project.getObjectBounds(position.id)}
					{@const isLayerLocked = positionsLayer?.locked ?? false}
					{#if bounds}
						<SelectableObject
							id={position.id}
							type="hanging-position"
							x={bounds.x}
							y={bounds.y}
							width={bounds.width}
							height={bounds.height}
							locked={position.locked || isLayerLocked}
							visible={position.visible}
							ondrag={(dx, dy) => handleDrag(position.id, dx, dy)}
						>
							<HangingPosition
								{position}
								isSelected={selection.isSelected(position.id)}
								isHovered={hoveredId === position.id}
							/>
						</SelectableObject>
					{/if}
				{/if}
			{/each}
		</g>
	{/if}

	<!-- Layer 3: Shapes (stage elements, basic shapes) -->
	{#if stageLayer?.visible}
		<g class="shapes-layer" style:opacity={stageLayer?.opacity ?? 1}>
			{#each project.shapes as shape (shape.id)}
				{#if shape.visible}
					{@const bounds = getGeometryBounds(shape.geometry)}
					{@const isLayerLocked = stageLayer?.locked ?? false}
					<SelectableObject
						id={shape.id}
						type="annotation"
						x={bounds.x}
						y={bounds.y}
						width={bounds.width}
						height={bounds.height}
						locked={shape.locked || isLayerLocked}
						visible={shape.visible}
						ondrag={(dx, dy) => handleDrag(shape.id, dx, dy)}
					>
						{#if shape.geometry.type === 'line'}
							<Line
								geometry={shape.geometry}
								stroke={shape.stroke}
								strokeWidth={shape.strokeWidth}
								isSelected={selection.isSelected(shape.id)}
								isHovered={hoveredId === shape.id}
							/>
						{:else if shape.geometry.type === 'rect'}
							<Rectangle
								geometry={shape.geometry}
								fill={shape.fill}
								stroke={shape.stroke}
								strokeWidth={shape.strokeWidth}
								isSelected={selection.isSelected(shape.id)}
								isHovered={hoveredId === shape.id}
							/>
						{:else if shape.geometry.type === 'circle'}
							<Circle
								geometry={shape.geometry as CircleGeometry}
								fill={shape.fill}
								stroke={shape.stroke}
								strokeWidth={shape.strokeWidth}
								isSelected={selection.isSelected(shape.id)}
								isHovered={hoveredId === shape.id}
							/>
						{/if}
					</SelectableObject>
				{/if}
			{/each}
		</g>
	{/if}

	<!-- Layer 4: Instruments (on top of hanging positions) -->
	{#if instrumentsLayer?.visible}
		<g class="instruments-wrapper" style:opacity={instrumentsLayer?.opacity ?? 1}>
			<InstrumentsLayer layerLocked={instrumentsLayer?.locked ?? false} />
		</g>
	{/if}

	<!-- Layer 5: Annotations (text, dimensions, notes) -->
	{#if annotationsLayer?.visible}
		<g class="annotations-layer" style:opacity={annotationsLayer?.opacity ?? 1}>
			{#each project.annotations as annotation (annotation.id)}
				{#if annotation.visible}
					{@const bounds = project.getObjectBounds(annotation.id)}
					{@const isLayerLocked = annotationsLayer?.locked ?? false}
					{#if bounds}
						<SelectableObject
							id={annotation.id}
							type="annotation"
							x={bounds.x}
							y={bounds.y}
							width={bounds.width}
							height={bounds.height}
							locked={annotation.locked || isLayerLocked}
							visible={annotation.visible}
							ondrag={(dx, dy) => handleDrag(annotation.id, dx, dy)}
						>
							<!-- Text annotation rendering -->
							<!-- Note: scale(1, -1) counter-flips the text since the viewport Y axis is flipped -->
							<g transform="translate({annotation.x}, {annotation.y}) scale(1, -1)">
								<text
									class="annotation-text"
									x={0}
									y={0}
									font-size={annotation.fontSize}
									font-family={annotation.fontFamily}
									fill={annotation.color}
								>
									{annotation.text}
								</text>
							</g>
						</SelectableObject>
					{/if}
				{/if}
			{/each}
		</g>
	{/if}
</g>

<style>
	.annotation-text {
		user-select: none;
		pointer-events: none;
	}
</style>
