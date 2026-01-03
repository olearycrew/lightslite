<script lang="ts">
	/**
	 * DrawingLayer Component
	 *
	 * Renders all shapes and objects from the project store.
	 * Organizes rendering by layer type for proper z-ordering.
	 */
	import { project } from '$lib/stores/project.svelte';
	import { selection } from '$lib/stores/selection.svelte';
	import { Line, Rectangle, Circle } from '../shapes';
	import HangingPosition from '../HangingPosition.svelte';
	import SelectableObject from '../SelectableObject.svelte';
	import InstrumentsLayer from './InstrumentsLayer.svelte';
	import type { LineGeometry, RectGeometry, CircleGeometry } from '$lib/types';
	import { getGeometryBounds } from '$lib/types';

	// Local hover tracking for shapes
	let hoveredId = $state<string | null>(null);

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
	 * Handle mouse enter for hover effect
	 */
	function handleMouseEnter(id: string) {
		hoveredId = id;
	}

	/**
	 * Handle mouse leave for hover effect
	 */
	function handleMouseLeave() {
		hoveredId = null;
	}
</script>

<g class="drawing-layer">
	<!-- Layer 1: Set Pieces (background) -->
	<g class="set-pieces-layer">
		{#each project.setPieces as setPiece (setPiece.id)}
			{#if setPiece.visible}
				{@const bounds = getGeometryBounds(setPiece.geometry)}
				<SelectableObject
					id={setPiece.id}
					type="set-piece"
					x={bounds.x}
					y={bounds.y}
					width={bounds.width}
					height={bounds.height}
					locked={setPiece.locked}
					visible={setPiece.visible}
					ondrag={(dx, dy) => handleDrag(setPiece.id, dx, dy)}
				>
					{#if setPiece.geometry.type === 'rect'}
						<Rectangle
							geometry={setPiece.geometry}
							fill={setPiece.fill}
							stroke={setPiece.stroke}
							strokeWidth={setPiece.strokeWidth}
							isSelected={selection.isSelected(setPiece.id)}
							isHovered={hoveredId === setPiece.id}
						/>
					{:else if setPiece.geometry.type === 'circle'}
						<Circle
							geometry={setPiece.geometry as CircleGeometry}
							fill={setPiece.fill}
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

	<!-- Layer 2: Hanging Positions -->
	<g class="hanging-positions-layer">
		{#each project.hangingPositions as position (position.id)}
			{#if position.visible}
				{@const bounds = project.getObjectBounds(position.id)}
				{#if bounds}
					<SelectableObject
						id={position.id}
						type="hanging-position"
						x={bounds.x}
						y={bounds.y}
						width={bounds.width}
						height={bounds.height}
						locked={position.locked}
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

	<!-- Layer 3: Shapes (annotations, basic shapes) -->
	<g class="shapes-layer">
		{#each project.shapes as shape (shape.id)}
			{#if shape.visible}
				{@const bounds = getGeometryBounds(shape.geometry)}
				<SelectableObject
					id={shape.id}
					type="annotation"
					x={bounds.x}
					y={bounds.y}
					width={bounds.width}
					height={bounds.height}
					locked={shape.locked}
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

	<!-- Layer 4: Instruments (on top of hanging positions) -->
	<InstrumentsLayer />

	<!-- Layer 5: Annotations (text, dimensions, notes) -->
	<g class="annotations-layer">
		{#each project.annotations as annotation (annotation.id)}
			{#if annotation.visible}
				{@const bounds = project.getObjectBounds(annotation.id)}
				{#if bounds}
					<SelectableObject
						id={annotation.id}
						type="annotation"
						x={bounds.x}
						y={bounds.y}
						width={bounds.width}
						height={bounds.height}
						locked={annotation.locked}
						visible={annotation.visible}
						ondrag={(dx, dy) => handleDrag(annotation.id, dx, dy)}
					>
						<!-- Text annotation rendering -->
						<text
							class="annotation-text"
							x={annotation.x}
							y={annotation.y}
							font-size={annotation.fontSize}
							font-family={annotation.fontFamily}
							fill={annotation.color}
						>
							{annotation.text}
						</text>
					</SelectableObject>
				{/if}
			{/if}
		{/each}
	</g>
</g>

<style>
	.annotation-text {
		user-select: none;
		pointer-events: none;
	}
</style>
