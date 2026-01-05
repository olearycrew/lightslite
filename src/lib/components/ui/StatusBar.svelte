<script lang="ts">
	/**
	 * Status Bar
	 *
	 * Shows:
	 * - Current zoom level
	 * - Scale indicator
	 * - Object count
	 * - Sync status
	 * - Grid snap status
	 */
	import { viewportStore, projectStore, connectionStore } from '$lib/stores';
	import { Tool } from '$lib/stores/tool.svelte';

	let zoom = $derived($viewportStore.zoom * 100);
	let scale = $derived($viewportStore.scale);
	let objectCount = $derived(
		($projectStore.instruments?.length || 0) +
			($projectStore.hangingPositions?.length || 0) +
			($projectStore.setPieces?.length || 0)
	);
	let syncStatus = $derived($connectionStore.syncStatus);
	let isDirty = $derived($connectionStore.isDirty);
	let gridEnabled = $derived($viewportStore.snapToGrid);

	function formatZoom(z: number): string {
		return Math.round(z) + '%';
	}
</script>

<footer
	class="flex h-8 items-center justify-between border-t border-border bg-bg-secondary px-3 text-xs text-text-secondary"
>
	<!-- Left: Zoom & Scale -->
	<div class="flex items-center gap-4">
		<span>Zoom: {formatZoom(zoom)}</span>
		{#if scale}
			<span>Scale: {scale.label}</span>
		{/if}
	</div>

	<!-- Center: Object count -->
	<div class="flex items-center gap-4">
		<span>Objects: {objectCount}</span>
	</div>

	<!-- Right: Status indicators -->
	<div class="flex items-center gap-4">
		{#if gridEnabled}
			<span class="flex items-center gap-1">
				<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M5 2a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zm3 4a1 1 0 011 1v6a1 1 0 11-2 0V7a1 1 0 011-1zm-3 5a1 1 0 011 1v2a1 1 0 11-2 0V12a1 1 0 011-1z"
						clip-rule="evenodd"
					/>
				</svg>
				Grid
			</span>
		{/if}

		{#if isDirty}
			<span class="flex items-center gap-1 text-amber-500">
				<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
						clip-rule="evenodd"
					/>
				</svg>
				Unsaved
			</span>
		{:else}
			<span class="flex items-center gap-1 text-emerald-500">
				<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clip-rule="evenodd"
					/>
				</svg>
				Saved
			</span>
		{/if}

		{#if syncStatus === 'syncing'}
			<span class="flex items-center gap-1 text-blue-500">
				<svg class="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
				Syncing...
			</span>
		{:else if syncStatus === 'offline'}
			<span class="flex items-center gap-1 text-amber-500">
				<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M5 9.293l-3 3V17a2 2 0 002 2h10a2 2 0 002-2v-4.707l-3-3a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
				Offline
			</span>
		{:else if syncStatus === 'online'}
			<span class="flex items-center gap-1 text-emerald-500">
				<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clip-rule="evenodd"
					/>
				</svg>
				Online
			</span>
		{/if}
	</div>
</footer>
