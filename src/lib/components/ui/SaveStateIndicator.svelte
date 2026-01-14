<script lang="ts">
	/**
	 * SaveStateIndicator - Visual indicator for server sync status
	 *
	 * Shows a colored dot indicator with tooltip:
	 * - Green: All changes saved to server
	 * - Yellow: Saving changes to server
	 * - Red: Error saving to server
	 * - Gray: Offline mode
	 */
	import { connection } from '$lib/stores/connection.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';

	// Derive the indicator state from connection store
	const indicatorState = $derived.by(() => {
		if (!connection.isOnline) {
			return {
				color: 'bg-gray-500',
				label: 'Offline',
				description: 'Working offline. Changes will sync when connection is restored.'
			};
		}

		if (connection.syncStatus === 'syncing') {
			return {
				color: 'bg-yellow-500',
				label: 'Saving',
				description: 'Saving changes to server...'
			};
		}

		if (connection.syncStatus === 'error') {
			return {
				color: 'bg-red-500',
				label: 'Error',
				description: connection.lastError || 'Failed to save changes to server'
			};
		}

		if (connection.isDirty) {
			return {
				color: 'bg-yellow-500',
				label: 'Unsaved',
				description: 'Changes pending save to server'
			};
		}

		return {
			color: 'bg-green-500',
			label: 'Saved',
			description: connection.lastSyncTime
				? `All changes saved at ${connection.lastSyncTime.toLocaleTimeString()}`
				: 'All changes saved'
		};
	});
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger>
			<div class="flex items-center gap-2">
				<div
					class="h-3 w-3 rounded-full {indicatorState.color} transition-colors duration-200"
					aria-label={indicatorState.label}
				></div>
			</div>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<div class="text-xs">
				<div class="font-semibold">{indicatorState.label}</div>
				<div class="text-text-muted">{indicatorState.description}</div>
			</div>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
