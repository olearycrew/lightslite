<script lang="ts">
	/**
	 * Canvas Container Component
	 *
	 * Wrapper that provides the full editor layout for the canvas.
	 * Manages keyboard listeners for spacebar pan mode and cursor feedback.
	 */
	import { onMount } from 'svelte';
	import Viewport from './Viewport.svelte';
	import { viewport } from '$lib/stores/viewport.svelte';

	interface Props {
		/** Slot content to render inside the viewport */
		children?: import('svelte').Snippet;
		/** Custom coordinates display snippet */
		coords?: import('svelte').Snippet;
	}

	let { children, coords }: Props = $props();

	// Spacebar state for pan mode
	let spacebarHeld = $state(false);

	// Container element reference for focus management
	let containerElement: HTMLDivElement;

	/**
	 * Handle keydown events for spacebar pan mode
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Only handle spacebar when not in an input field
		if (event.code === 'Space' && !isInputFocused()) {
			event.preventDefault();
			spacebarHeld = true;
		}
	}

	/**
	 * Handle keyup events to release spacebar pan mode
	 */
	function handleKeyUp(event: KeyboardEvent) {
		if (event.code === 'Space') {
			spacebarHeld = false;
		}
	}

	/**
	 * Check if an input element is currently focused
	 */
	function isInputFocused(): boolean {
		const active = document.activeElement;
		if (!active) return false;
		const tagName = active.tagName.toLowerCase();
		return (
			tagName === 'input' ||
			tagName === 'textarea' ||
			tagName === 'select' ||
			active.hasAttribute('contenteditable')
		);
	}

	/**
	 * Handle window blur - release spacebar if window loses focus
	 */
	function handleWindowBlur() {
		spacebarHeld = false;
	}

	// Setup global keyboard listeners
	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('blur', handleWindowBlur);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('blur', handleWindowBlur);
		};
	});
</script>

<div
	bind:this={containerElement}
	class="canvas-container"
	class:panning={spacebarHeld}
	role="application"
	aria-label="Canvas viewport"
	tabindex="-1"
>
	<Viewport {spacebarHeld}>
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
