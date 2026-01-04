<script lang="ts">
	/**
	 * ShapeProperties Component
	 *
	 * Properties panel for editing basic shapes (lines, rectangles, circles).
	 */
	import { project, type ShapeObject } from '$lib/stores/project.svelte';
	import { selection } from '$lib/stores/selection.svelte';
	import {
		FormField,
		NumberInput,
		TextInput,
		ColorInput,
		Slider,
		CollapsibleSection
	} from '../forms';
	import type { LineGeometry, RectGeometry, CircleGeometry } from '$lib/types';

	interface Props {
		shape: ShapeObject;
	}

	let { shape }: Props = $props();

	// Update shape when values change
	function updateShape<K extends keyof ShapeObject>(key: K, value: ShapeObject[K]) {
		project.updateShape(shape.id, { [key]: value });
	}

	function updateGeometry(newGeometry: ShapeObject['geometry']) {
		project.updateShape(shape.id, { geometry: newGeometry });
	}

	// Handler functions for direct updates
	function handleNameChange(value: string | null) {
		if (value !== null) {
			updateShape('name', value);
		}
	}

	function handleStrokeChange(value: string | null) {
		updateShape('stroke', value ?? undefined);
	}

	function handleFillChange(value: string | null) {
		updateShape('fill', value ?? undefined);
	}

	function handleStrokeWidthChange(value: number) {
		updateShape('strokeWidth', value);
	}

	// Geometry update handlers for line
	function handleX1Change(value: number | null) {
		if (shape.geometry.type === 'line' && value !== null) {
			updateGeometry({ ...shape.geometry, x1: value });
		}
	}

	function handleY1Change(value: number | null) {
		if (shape.geometry.type === 'line' && value !== null) {
			updateGeometry({ ...shape.geometry, y1: value });
		}
	}

	function handleX2Change(value: number | null) {
		if (shape.geometry.type === 'line' && value !== null) {
			updateGeometry({ ...shape.geometry, x2: value });
		}
	}

	function handleY2Change(value: number | null) {
		if (shape.geometry.type === 'line' && value !== null) {
			updateGeometry({ ...shape.geometry, y2: value });
		}
	}

	// Geometry update handlers for rect
	function handleXChange(value: number | null) {
		if (shape.geometry.type === 'rect' && value !== null) {
			updateGeometry({ ...shape.geometry, x: value });
		}
	}

	function handleYChange(value: number | null) {
		if (shape.geometry.type === 'rect' && value !== null) {
			updateGeometry({ ...shape.geometry, y: value });
		}
	}

	function handleWidthChange(value: number | null) {
		if (shape.geometry.type === 'rect' && value !== null) {
			updateGeometry({ ...shape.geometry, width: value });
		}
	}

	function handleHeightChange(value: number | null) {
		if (shape.geometry.type === 'rect' && value !== null) {
			updateGeometry({ ...shape.geometry, height: value });
		}
	}

	// Geometry update handlers for circle
	function handleCxChange(value: number | null) {
		if (shape.geometry.type === 'circle' && value !== null) {
			updateGeometry({ ...shape.geometry, cx: value });
		}
	}

	function handleCyChange(value: number | null) {
		if (shape.geometry.type === 'circle' && value !== null) {
			updateGeometry({ ...shape.geometry, cy: value });
		}
	}

	function handleRadiusChange(value: number | null) {
		if (shape.geometry.type === 'circle' && value !== null) {
			updateGeometry({ ...shape.geometry, radius: value });
		}
	}

	/**
	 * Delete this shape
	 */
	function deleteShape() {
		selection.clearSelection();
		project.deleteShape(shape.id);
	}

	// Shape type for display - use a single derived
	const shapeTypeLabel = $derived.by(() => {
		switch (shape.geometry.type) {
			case 'line':
				return 'Line';
			case 'rect':
				return 'Rectangle';
			case 'circle':
				return 'Circle';
			default:
				return 'Shape';
		}
	});
</script>

<div class="shape-properties">
	<CollapsibleSection title="Shape">
		<FormField label="Name">
			<TextInput value={shape.name} onchange={handleNameChange} placeholder="Shape name" />
		</FormField>

		<FormField label="Type">
			<span class="shape-type-label">{shapeTypeLabel}</span>
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Style">
		<FormField label="Stroke" layout="vertical">
			<ColorInput
				value={shape.stroke ?? null}
				onchange={handleStrokeChange}
				placeholder="Stroke color"
			/>
		</FormField>

		{#if shape.geometry.type !== 'line'}
			<FormField label="Fill" layout="vertical">
				<ColorInput
					value={shape.fill ?? null}
					onchange={handleFillChange}
					placeholder="Fill color"
				/>
			</FormField>
		{/if}

		<FormField label="Stroke Width">
			<Slider
				value={shape.strokeWidth ?? 2}
				onchange={handleStrokeWidthChange}
				min={0.5}
				max={10}
				step={0.5}
				unit="px"
			/>
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Position & Size">
		{#if shape.geometry.type === 'line'}
			{@const lineGeom = shape.geometry as LineGeometry}
			<div class="position-grid">
				<FormField label="X1">
					<NumberInput value={lineGeom.x1} onchange={handleX1Change} />
				</FormField>
				<FormField label="Y1">
					<NumberInput value={lineGeom.y1} onchange={handleY1Change} />
				</FormField>
				<FormField label="X2">
					<NumberInput value={lineGeom.x2} onchange={handleX2Change} />
				</FormField>
				<FormField label="Y2">
					<NumberInput value={lineGeom.y2} onchange={handleY2Change} />
				</FormField>
			</div>
		{:else if shape.geometry.type === 'rect'}
			{@const rectGeom = shape.geometry as RectGeometry}
			<div class="position-grid">
				<FormField label="X">
					<NumberInput value={rectGeom.x} onchange={handleXChange} />
				</FormField>
				<FormField label="Y">
					<NumberInput value={rectGeom.y} onchange={handleYChange} />
				</FormField>
				<FormField label="Width">
					<NumberInput value={rectGeom.width} onchange={handleWidthChange} min={0} />
				</FormField>
				<FormField label="Height">
					<NumberInput value={rectGeom.height} onchange={handleHeightChange} min={0} />
				</FormField>
			</div>
		{:else if shape.geometry.type === 'circle'}
			{@const circleGeom = shape.geometry as CircleGeometry}
			<div class="position-grid">
				<FormField label="Center X">
					<NumberInput value={circleGeom.cx} onchange={handleCxChange} />
				</FormField>
				<FormField label="Center Y">
					<NumberInput value={circleGeom.cy} onchange={handleCyChange} />
				</FormField>
				<FormField label="Radius">
					<NumberInput value={circleGeom.radius} onchange={handleRadiusChange} min={0} />
				</FormField>
			</div>
		{/if}
	</CollapsibleSection>

	<CollapsibleSection title="Actions" defaultOpen={false}>
		<button type="button" class="delete-btn" onclick={deleteShape}>Delete Shape</button>
	</CollapsibleSection>
</div>

<style>
	.shape-properties {
		display: flex;
		flex-direction: column;
	}

	.shape-type-label {
		font-size: 12px;
		color: var(--color-text-secondary, #999);
		padding: 6px 0;
	}

	.position-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.delete-btn {
		width: 100%;
		padding: 8px 12px;
		background: rgba(255, 100, 100, 0.1);
		border: 1px solid rgba(255, 100, 100, 0.3);
		border-radius: 4px;
		color: #ff6464;
		font-size: 12px;
		cursor: pointer;
	}

	.delete-btn:hover {
		background: rgba(255, 100, 100, 0.2);
		border-color: rgba(255, 100, 100, 0.5);
	}
</style>
