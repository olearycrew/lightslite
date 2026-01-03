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

	// Local state for editing
	let name = $state(shape.name);
	let stroke = $state(shape.stroke ?? '#000000');
	let fill = $state(shape.fill ?? 'transparent');
	let strokeWidth = $state(shape.strokeWidth ?? 2);

	// Geometry-specific state
	let x1 = $state(0);
	let y1 = $state(0);
	let x2 = $state(0);
	let y2 = $state(0);
	let x = $state(0);
	let y = $state(0);
	let width = $state(0);
	let height = $state(0);
	let cx = $state(0);
	let cy = $state(0);
	let radius = $state(0);

	// Initialize geometry state based on shape type
	$effect(() => {
		const geo = shape.geometry;
		if (geo.type === 'line') {
			x1 = geo.x1;
			y1 = geo.y1;
			x2 = geo.x2;
			y2 = geo.y2;
		} else if (geo.type === 'rect') {
			x = geo.x;
			y = geo.y;
			width = geo.width;
			height = geo.height;
		} else if (geo.type === 'circle') {
			cx = geo.cx;
			cy = geo.cy;
			radius = geo.radius;
		}
	});

	// Update shape when values change
	function updateShape<K extends keyof ShapeObject>(key: K, value: ShapeObject[K]) {
		project.updateShape(shape.id, { [key]: value });
	}

	function updateGeometry() {
		const geo = shape.geometry;
		let newGeometry = geo;

		if (geo.type === 'line') {
			newGeometry = { type: 'line', x1, y1, x2, y2 } as LineGeometry;
		} else if (geo.type === 'rect') {
			newGeometry = { type: 'rect', x, y, width, height } as RectGeometry;
		} else if (geo.type === 'circle') {
			newGeometry = { type: 'circle', cx, cy, radius } as CircleGeometry;
		}

		project.updateShape(shape.id, { geometry: newGeometry });
	}

	// Watchers for common properties
	$effect(() => {
		if (name !== shape.name) {
			updateShape('name', name);
		}
	});

	$effect(() => {
		if (stroke !== shape.stroke) {
			updateShape('stroke', stroke ?? undefined);
		}
	});

	$effect(() => {
		if (fill !== shape.fill) {
			updateShape('fill', fill ?? undefined);
		}
	});

	$effect(() => {
		if (strokeWidth !== shape.strokeWidth) {
			updateShape('strokeWidth', strokeWidth);
		}
	});

	/**
	 * Delete this shape
	 */
	function deleteShape() {
		selection.clearSelection();
		project.deleteShape(shape.id);
	}

	// Shape type for display
	const shapeTypeLabel = $derived(() => {
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
			<TextInput bind:value={name} placeholder="Shape name" />
		</FormField>

		<FormField label="Type">
			<span class="shape-type-label">{shapeTypeLabel()}</span>
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Style">
		<FormField label="Stroke" layout="vertical">
			<ColorInput bind:value={stroke} placeholder="Stroke color" />
		</FormField>

		{#if shape.geometry.type !== 'line'}
			<FormField label="Fill" layout="vertical">
				<ColorInput bind:value={fill} placeholder="Fill color" />
			</FormField>
		{/if}

		<FormField label="Stroke Width">
			<Slider bind:value={strokeWidth} min={0.5} max={10} step={0.5} unit="px" />
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Position & Size">
		{#if shape.geometry.type === 'line'}
			<div class="position-grid">
				<FormField label="X1">
					<NumberInput bind:value={x1} onchange={updateGeometry} />
				</FormField>
				<FormField label="Y1">
					<NumberInput bind:value={y1} onchange={updateGeometry} />
				</FormField>
				<FormField label="X2">
					<NumberInput bind:value={x2} onchange={updateGeometry} />
				</FormField>
				<FormField label="Y2">
					<NumberInput bind:value={y2} onchange={updateGeometry} />
				</FormField>
			</div>
		{:else if shape.geometry.type === 'rect'}
			<div class="position-grid">
				<FormField label="X">
					<NumberInput bind:value={x} onchange={updateGeometry} />
				</FormField>
				<FormField label="Y">
					<NumberInput bind:value={y} onchange={updateGeometry} />
				</FormField>
				<FormField label="Width">
					<NumberInput bind:value={width} onchange={updateGeometry} min={0} />
				</FormField>
				<FormField label="Height">
					<NumberInput bind:value={height} onchange={updateGeometry} min={0} />
				</FormField>
			</div>
		{:else if shape.geometry.type === 'circle'}
			<div class="position-grid">
				<FormField label="Center X">
					<NumberInput bind:value={cx} onchange={updateGeometry} />
				</FormField>
				<FormField label="Center Y">
					<NumberInput bind:value={cy} onchange={updateGeometry} />
				</FormField>
				<FormField label="Radius">
					<NumberInput bind:value={radius} onchange={updateGeometry} min={0} />
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
