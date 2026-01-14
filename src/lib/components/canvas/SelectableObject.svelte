<script lang="ts">
	/**
	 * SelectableObject Component
	 *
	 * Generic wrapper for any canvas object that can be selected.
	 * Handles:
	 * - Click handling with modifier key support (shift, ctrl/cmd)
	 * - Visual feedback for hover and selected states
	 * - Dragging support for moving selected objects
	 */
	import type { Snippet } from 'svelte';
	import { selection, type SelectionType } from '$lib/stores';
	import { viewport } from '$lib/stores/viewport.svelte';
	import { tool } from '$lib/stores/tool.svelte';

	interface Props {
		/** Unique ID of this object */
		id: string;
		/** Type of selectable object */
		type: Exclude<SelectionType, 'mixed' | null>;
		/** Bounding box for the object */
		x: number;
		y: number;
		width: number;
		height: number;
		/** Whether this object is locked (cannot be selected/moved) */
		locked?: boolean;
		/** Whether this object is visible */
		visible?: boolean;
		/** Children to render inside the selectable area */
		children: Snippet;
		/** Callback when object is dragged (delta in world coordinates) */
		ondrag?: (deltaX: number, deltaY: number) => void;
		/** Callback when drag starts */
		ondragstart?: () => void;
		/** Callback when drag ends */
		ondragend?: () => void;
	}

	let {
		id,
		type,
		x,
		y,
		width,
		height,
		locked = false,
		visible = true,
		children,
		ondrag,
		ondragstart,
		ondragend
	}: Props = $props();

	// Local state
	let isHovered = $state(false);
	let isDragging = $state(false);
	let dragStartX = $state(0);
	let dragStartY = $state(0);

	// Derived: whether this object is currently selected
	const isSelected = $derived(selection.isSelected(id));

	// Derived: visual states
	const showHoverOutline = $derived(isHovered && !isSelected && !locked);
	const showSelectedOutline = $derived(isSelected && !locked);

	/**
	 * Handle mouse enter for hover state
	 */
	function handleMouseEnter() {
		if (!locked) {
			isHovered = true;
		}
	}

	/**
	 * Handle mouse leave for hover state
	 */
	function handleMouseLeave() {
		isHovered = false;
	}

	/**
	 * Handle mouse down for selection and drag initiation
	 */
	function handleMouseDown(event: MouseEvent) {
		if (locked) return;

		// Prevent event from bubbling to viewport (would trigger marquee select)
		event.stopPropagation();

		const isShiftKey = event.shiftKey;
		const isCtrlOrCmd = event.ctrlKey || event.metaKey;

		if (isCtrlOrCmd) {
			// Toggle selection
			selection.toggleSelection(id, type);
		} else if (isShiftKey) {
			// Add to selection
			selection.addToSelection(id, type);
		} else {
			// If clicking on an already selected object, don't change selection (allow drag)
			// If clicking on unselected object, select it (replacing current selection)
			if (!isSelected) {
				selection.select(id, type);
			}
		}

		// Only allow dragging if not in pan mode
		if (!tool.isPanTool) {
			// Start drag tracking
			const worldCoords = viewport.screenToWorld(event.clientX, event.clientY);
			dragStartX = worldCoords.x;
			dragStartY = worldCoords.y;
			isDragging = true;

			ondragstart?.();

			// Add global listeners for drag
			window.addEventListener('mousemove', handleGlobalMouseMove);
			window.addEventListener('mouseup', handleGlobalMouseUp);
		}
	}

	/**
	 * Handle global mouse move during drag
	 */
	function handleGlobalMouseMove(event: MouseEvent) {
		if (!isDragging) return;

		const worldCoords = viewport.screenToWorld(event.clientX, event.clientY);
		const deltaX = worldCoords.x - dragStartX;
		const deltaY = worldCoords.y - dragStartY;

		if (deltaX !== 0 || deltaY !== 0) {
			ondrag?.(deltaX, deltaY);
			dragStartX = worldCoords.x;
			dragStartY = worldCoords.y;
		}
	}

	/**
	 * Handle global mouse up to end drag
	 */
	function handleGlobalMouseUp() {
		if (isDragging) {
			isDragging = false;
			ondragend?.();
		}

		// Remove global listeners
		window.removeEventListener('mousemove', handleGlobalMouseMove);
		window.removeEventListener('mouseup', handleGlobalMouseUp);
	}

	/**
	 * Handle double click for editing (future use)
	 */
	function handleDoubleClick(event: MouseEvent) {
		if (locked) return;
		event.stopPropagation();
		// Future: trigger edit mode for the object
	}

	// Visual feedback line widths (inverse zoom for consistent screen size)
	const strokeWidth = $derived(2 / viewport.zoom);
</script>

{#if visible}
	<g
		class="selectable-object"
		class:selected={showSelectedOutline}
		class:hovered={showHoverOutline}
		class:locked
		class:dragging={isDragging}
		role="button"
		tabindex="0"
		aria-label="Selectable canvas object"
		aria-pressed={isSelected}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		onmousedown={handleMouseDown}
		ondblclick={handleDoubleClick}
	>
		<!-- Render the actual object content -->
		{@render children()}

		<!-- Hover outline (shown when hovered but not selected) -->
		{#if showHoverOutline}
			<rect
				class="hover-outline"
				x={x - 2 / viewport.zoom}
				y={y - 2 / viewport.zoom}
				width={width + 4 / viewport.zoom}
				height={height + 4 / viewport.zoom}
				stroke-width={strokeWidth}
			/>
		{/if}

		<!-- Selection outline (shown when selected) -->
		{#if showSelectedOutline}
			<rect
				class="selection-outline"
				x={x - 2 / viewport.zoom}
				y={y - 2 / viewport.zoom}
				width={width + 4 / viewport.zoom}
				height={height + 4 / viewport.zoom}
				stroke-width={strokeWidth}
			/>
		{/if}
	</g>
{/if}

<style>
	.selectable-object {
		cursor: default;
		outline: none;
	}

	.selectable-object:not(.locked) {
		cursor: pointer;
	}

	.selectable-object.dragging {
		cursor: grabbing;
	}

	.selectable-object.locked {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.hover-outline {
		fill: none;
		stroke: #999;
		stroke-dasharray: 4, 2;
		pointer-events: none;
	}

	.selection-outline {
		fill: none;
		stroke: #4287f5;
		pointer-events: none;
	}
</style>
