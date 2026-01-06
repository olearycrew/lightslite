<script lang="ts">
	/**
	 * Status Bar
	 *
	 * Shows:
	 * - Current zoom level
	 * - Scale indicator
	 * - Object count
	 * - Sync status with visual indicator (yellow/green/red circle)
	 * - Grid snap status
	 */
	import { viewport } from '$lib/stores/viewport.svelte';
	import { project } from '$lib/stores/project.svelte';
	import { connection } from '$lib/stores/connection.svelte';
	import { grid } from '$lib/stores/grid.svelte';

	let zoom = $derived(viewport.zoom * 100);
	let objectCount = $derived(
		(project.instruments?.length || 0) +
			(project.hangingPositions?.length || 0) +
			(project.setPieces?.length || 0)
	);

	// Connection status
	let syncStatus = $derived(connection.connectionStatus);
	let lastSyncTime = $derived(connection.lastSyncTime);
	let lastError = $derived(connection.lastError);
	let gridEnabled = $derived(grid.snapToGrid);

	function formatZoom(z: number): string {
		return Math.round(z) + '%';
	}

	function formatLastSyncTime(date: Date | null): string {
		if (!date) return 'Never';
		return date.toLocaleTimeString();
	}

	// Get color for sync status indicator
	function getSyncIndicatorColor(): string {
		switch (syncStatus) {
			case 'online-synced':
				return 'bg-emerald-500';
			case 'online-syncing':
				return 'bg-amber-500 animate-pulse';
			case 'online-dirty':
				return 'bg-amber-500';
			case 'offline':
				return 'bg-gray-400';
			case 'error':
				return 'bg-red-500';
			default:
				return 'bg-gray-400';
		}
	}

	// Get tooltip text for sync status
	function getSyncStatusText(): string {
		switch (syncStatus) {
			case 'online-synced':
				return `All changes saved${lastSyncTime ? ` at ${formatLastSyncTime(lastSyncTime)}` : ''}`;
			case 'online-syncing':
				return 'Syncing with server...';
			case 'online-dirty':
				return 'Unsaved changes';
			case 'offline':
				return 'Offline - changes saved locally';
			case 'error':
				return `Sync error${lastError ? ': ' + lastError : ''}`;
			default:
				return 'Unknown status';
		}
	}
</script>

<footer
	class="flex h-8 items-center justify-between border-t border-border bg-bg-secondary px-3 text-xs text-text-secondary"
>
	<!-- Left: Zoom -->
	<div class="flex items-center gap-4">
		<span>Zoom: {formatZoom(zoom)}</span>
	</div>

	<!-- Center: Object count -->
	<div class="flex items-center gap-4">
		<span>Objects: {objectCount}</span>
	</div>

	<!-- Right: Status indicators -->
	<div class="flex items-center gap-4">
		{#if gridEnabled}
			<span class="flex items-center gap-1 text-muted-foreground">
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

		<!-- Sync Status Indicator with tooltip -->
		<div class="relative group">
			<div class="flex items-center gap-1.5 cursor-help" title={getSyncStatusText()}>
				<span class="w-2 h-2 rounded-full {getSyncIndicatorColor()}"></span>
				<span class="text-muted-foreground">
					{#if syncStatus === 'online-synced'}
						Saved
					{:else if syncStatus === 'online-syncing'}
						Syncing...
					{:else if syncStatus === 'online-dirty'}
						Unsaved
					{:else if syncStatus === 'offline'}
						Offline
					{:else if syncStatus === 'error'}
						Sync Error
					{:else}
						Unknown
					{/if}
				</span>
			</div>

			<!-- Tooltip -->
			<div
				class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50"
			>
				{getSyncStatusText()}
			</div>
		</div>
	</div>
</footer>
