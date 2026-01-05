<script lang="ts">
	/**
	 * OfflineIndicator Component
	 *
	 * Displays the current connection and sync status to the user.
	 * Shows different states: online-synced, syncing, dirty, offline, error.
	 *
	 * Features:
	 * - Non-intrusive badge/banner when offline
	 * - Toast notifications for connection changes
	 * - Retry button on sync errors
	 */

	import { connection, type ConnectionStatus } from '$lib/stores/connection.svelte';

	interface Props {
		/** Whether to show the synced state (usually hidden) */
		showWhenSynced?: boolean;
		/** Position of the indicator */
		position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
	}

	let { showWhenSynced = false, position = 'bottom-right' }: Props = $props();

	/** Get the status configuration for display */
	function getStatusConfig(status: ConnectionStatus) {
		switch (status) {
			case 'online-synced':
				return {
					icon: 'cloud-check',
					label: 'All changes saved',
					bgClass: 'bg-green/20',
					textClass: 'text-green',
					borderClass: 'border-green/40',
					visible: showWhenSynced
				};
			case 'online-syncing':
				return {
					icon: 'cloud-sync',
					label: 'Syncing...',
					bgClass: 'bg-yellow/20',
					textClass: 'text-yellow',
					borderClass: 'border-yellow/40',
					visible: true,
					animate: true
				};
			case 'online-dirty':
				return {
					icon: 'cloud-pending',
					label: 'Unsaved changes',
					bgClass: 'bg-yellow/20',
					textClass: 'text-yellow',
					borderClass: 'border-yellow/40',
					visible: true
				};
			case 'offline':
				return {
					icon: 'cloud-off',
					label: 'Working offline',
					sublabel: 'Changes saved locally',
					bgClass: 'bg-peach/20',
					textClass: 'text-peach',
					borderClass: 'border-peach/40',
					visible: true
				};
			case 'error':
				return {
					icon: 'cloud-error',
					label: 'Sync error',
					sublabel: connection.lastError || 'Unable to save',
					bgClass: 'bg-red/20',
					textClass: 'text-red',
					borderClass: 'border-red/40',
					visible: true,
					showRetry: true
				};
		}
	}

	/** Get CSS position classes */
	function getPositionClasses(pos: typeof position) {
		switch (pos) {
			case 'bottom-right':
				return 'bottom-4 right-4';
			case 'bottom-left':
				return 'bottom-4 left-4';
			case 'top-right':
				return 'top-4 right-4';
			case 'top-left':
				return 'top-4 left-4';
		}
	}

	/** Get toast background classes based on type */
	function getToastClasses(type: 'info' | 'success' | 'warning' | 'error') {
		switch (type) {
			case 'info':
				return 'bg-blue/20 border-blue/40 text-blue';
			case 'success':
				return 'bg-green/20 border-green/40 text-green';
			case 'warning':
				return 'bg-yellow/20 border-yellow/40 text-yellow';
			case 'error':
				return 'bg-red/20 border-red/40 text-red';
		}
	}

	/** Handle retry button click */
	async function handleRetry() {
		// The SyncManager handles retry internally, but we can trigger a fresh sync
		// by dispatching a custom event or calling a method. For now, we'll
		// add a placeholder and integrate with SyncManager later.
		// This would call: syncManager.syncToServer()
		connection.addToast({
			type: 'info',
			message: 'Retrying sync...',
			autoDismiss: true
		});
	}

	const statusConfig = $derived(getStatusConfig(connection.connectionStatus));
	const positionClasses = $derived(getPositionClasses(position));
</script>

<!-- Status Badge -->
{#if statusConfig.visible}
	<div
		class="fixed {positionClasses} z-50 flex flex-col gap-2 items-end"
		role="status"
		aria-live="polite"
	>
		<!-- Main Status Badge -->
		<div
			class="flex items-center gap-2 rounded-lg border px-3 py-2 shadow-lg backdrop-blur-sm {statusConfig.bgClass} {statusConfig.borderClass}"
		>
			<!-- Icon -->
			<span
				class="flex-shrink-0 {statusConfig.textClass}"
				class:animate-pulse={statusConfig.animate}
			>
				{#if statusConfig.icon === 'cloud-check'}
					<!-- Cloud Check Icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
						<path d="m9 15 2 2 4-4" />
					</svg>
				{:else if statusConfig.icon === 'cloud-sync'}
					<!-- Cloud Sync Icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 animate-spin"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
						<path d="M12 13v3" />
						<path d="M12 9v1" />
					</svg>
				{:else if statusConfig.icon === 'cloud-pending'}
					<!-- Cloud Pending Icon (ellipsis) -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
						<circle cx="9" cy="15" r="1" fill="currentColor" />
						<circle cx="12" cy="15" r="1" fill="currentColor" />
						<circle cx="15" cy="15" r="1" fill="currentColor" />
					</svg>
				{:else if statusConfig.icon === 'cloud-off'}
					<!-- Cloud Off Icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="m2 2 20 20" />
						<path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193" />
						<path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.002 7.002 0 0 0 9.364 4.659" />
					</svg>
				{:else if statusConfig.icon === 'cloud-error'}
					<!-- Cloud Error Icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
						<path d="M12 8v4" />
						<path d="M12 16h.01" />
					</svg>
				{/if}
			</span>

			<!-- Text -->
			<div class="flex flex-col">
				<span class="text-sm font-medium {statusConfig.textClass}">
					{statusConfig.label}
				</span>
				{#if statusConfig.sublabel}
					<span class="text-xs text-text-muted truncate max-w-[200px]">
						{statusConfig.sublabel}
					</span>
				{/if}
			</div>

			<!-- Retry Button -->
			{#if statusConfig.showRetry}
				<button
					onclick={handleRetry}
					class="ml-2 rounded px-2 py-1 text-xs font-medium bg-red/30 text-red hover:bg-red/40 transition-colors"
				>
					Retry
				</button>
			{/if}
		</div>
	</div>
{/if}

<!-- Toast Notifications -->
{#if connection.toasts.length > 0}
	<div class="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
		{#each connection.toasts as toast (toast.id)}
			{@const toastClasses = getToastClasses(toast.type)}
			<div
				class="flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-right duration-300 {toastClasses}"
				role="alert"
			>
				<!-- Toast Icon -->
				<span>
					{#if toast.type === 'info'}
						<svg
							class="h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="M12 16v-4" />
							<path d="M12 8h.01" />
						</svg>
					{:else if toast.type === 'success'}
						<svg
							class="h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="m9 12 2 2 4-4" />
						</svg>
					{:else if toast.type === 'warning'}
						<svg
							class="h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
							<path d="M12 9v4" />
							<path d="M12 17h.01" />
						</svg>
					{:else if toast.type === 'error'}
						<svg
							class="h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="m15 9-6 6" />
							<path d="m9 9 6 6" />
						</svg>
					{/if}
				</span>

				<!-- Toast Message -->
				<span class="text-sm text-text-primary">{toast.message}</span>

				<!-- Dismiss Button -->
				<button
					onclick={() => connection.dismissToast(toast.id)}
					class="ml-2 text-text-muted hover:text-text-primary transition-colors"
					aria-label="Dismiss notification"
				>
					<svg
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</div>
		{/each}
	</div>
{/if}
