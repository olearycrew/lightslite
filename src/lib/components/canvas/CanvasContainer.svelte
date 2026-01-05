<script lang="ts">
	/**
	 * Canvas Container Component
	 *
	 * Wrapper that provides the full editor layout for the canvas.
	 * Provides cursor feedback based on tool state.
	 *
	 * Note: Keyboard shortcuts including spacebar pan are handled globally
	 * by KeyboardShortcuts.svelte
	 */
	import Viewport from './Viewport.svelte';
	import { viewport } from '$lib/stores/viewport.svelte';
	import { tool } from '$lib/stores/tool.svelte';

	interface Props {
		/** Slot content to render inside the viewport */
		children?: import('svelte').Snippet;
		/** Custom coordinates display snippet */
		coords?: import('svelte').Snippet;
	}

	let { children, coords }: Props = $props();

	// Container element reference for focus management
	let containerElement: HTMLDivElement;

	// Check if we're in pan mode (either permanent or temporary via spacebar)
	const isPanning = $derived(tool.isPanTool);
</script>

<div
	bind:this={containerElement}
	class="canvas-container"
	class:panning={isPanning}
	role="application"
	aria-label="Canvas viewport"
	tabindex="-1"
>
	<Viewport spacebarHeld={isPanning}>
		{#if children}
			{@render children()}
		{/if}
	</Viewport>

	<!-- Zoom indicator overlay -->
	<div class="zoom-indicator">
		{viewport.zoomPercent}%
	</div>

	<!-- Coordinates indicator (bottom left) -->
	<div class="coords-indicator">
		{#if coords}
			{@render coords()}
		{:else}
			<span>Pan: {Math.round(viewport.panX)}, {Math.round(viewport.panY)}</span>
		{/if}
	</div>
</div>

<style>
	.canvas-container {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		outline: none;
	}

	.canvas-container.panning {
		cursor: grab;
	}

	.zoom-indicator {
		position: absolute;
		bottom: 8px;
		right: 8px;
		padding: 4px 8px;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 12px;
		color: var(--color-text-secondary);
		pointer-events: none;
		user-select: none;
	}

	.coords-indicator {
		position: absolute;
		bottom: 8px;
		left: 8px;
		padding: 4px 8px;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 12px;
		color: var(--color-text-secondary);
		pointer-events: none;
		user-select: none;
	}
</style>
