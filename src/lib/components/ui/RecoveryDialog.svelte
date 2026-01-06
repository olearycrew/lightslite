<script lang="ts">
	/**
	 * RecoveryDialog - UI component for crash recovery
	 *
	 * Uses bits-ui Dialog for proper accessibility and focus management.
	 * Displays when unsaved changes are detected from a previous session.
	 * Provides options to:
	 * - Restore from cached IndexedDB data
	 * - Discard local changes and use server version
	 */
	import * as Dialog from './dialog';
	import type { RecoveryInfo } from '$lib/sync/indexeddb';
	import { Button } from './button';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	// Props
	interface Props {
		/** Whether the dialog is open */
		open: boolean;
		/** Recovery information to display */
		recoveryInfo: RecoveryInfo | null;
		/** Whether a recovery action is in progress */
		isRecovering?: boolean;
		/** Callback when user chooses to restore */
		onRestore?: () => void;
		/** Callback when user chooses to discard */
		onDiscard?: () => void;
		/** Callback when dialog is closed/cancelled */
		onClose?: () => void;
	}

	let {
		open = $bindable(false),
		recoveryInfo = null,
		isRecovering = false,
		onRestore,
		onDiscard,
		onClose
	}: Props = $props();

	// Format a date for display
	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleString();
	}

	// Calculate time since last save
	function formatTimeSince(timestamp: number): string {
		const now = Date.now();
		const diffMs = now - timestamp;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffDays > 0) {
			return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
		} else if (diffHours > 0) {
			return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
		} else if (diffMins > 0) {
			return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
		} else {
			return 'Just now';
		}
	}

	// Handle restore action
	function handleRestore() {
		onRestore?.();
	}

	// Handle discard action
	function handleDiscard() {
		onDiscard?.();
	}

	// Handle dialog close
	function handleOpenChange(isOpen: boolean) {
		if (!isOpen && !isRecovering) {
			open = false;
			onClose?.();
		}
	}
</script>

{#if recoveryInfo}
	<Dialog.Root bind:open onOpenChange={handleOpenChange}>
		<Dialog.Content class="max-w-lg" showClose={!isRecovering}>
			<!-- Recovery Icon -->
			<div class="mb-4 flex justify-center">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
					<RefreshCw class="h-6 w-6 text-blue-500" />
				</div>
			</div>

			<Dialog.Header>
				<Dialog.Title>Recover Unsaved Changes?</Dialog.Title>
				<Dialog.Description>
					We found unsaved changes from a previous session. Would you like to restore them?
				</Dialog.Description>
			</Dialog.Header>

			<!-- Recovery Info -->
			<div class="mb-4 space-y-2 rounded-md border border-border bg-muted/50 p-3 text-sm">
				<div class="flex justify-between">
					<span class="text-muted-foreground">Project:</span>
					<span class="font-medium text-foreground">{recoveryInfo.projectName}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Last saved:</span>
					<span class="text-foreground">{formatDate(recoveryInfo.localUpdatedAt)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Time since:</span>
					<span class="text-foreground">{formatTimeSince(recoveryInfo.localUpdatedAt)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Local version:</span>
					<span class="font-mono text-foreground">v{recoveryInfo.localVersion}</span>
				</div>
			</div>

			<!-- Warning message -->
			<div class="mb-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
				<div class="flex items-start gap-2">
					<AlertTriangle class="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
					<p class="text-muted-foreground">
						This may have happened due to a browser crash, unexpected closure, or network issue. The
						changes were saved locally but not synced to the server.
					</p>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex flex-col gap-3">
				<!-- Primary action: Restore -->
				<Button variant="default" class="w-full" onclick={handleRestore} disabled={isRecovering}>
					{#if isRecovering}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Restoring...
					{:else}
						Restore My Changes
					{/if}
				</Button>

				<!-- Secondary action: Discard -->
				<Button variant="outline" class="w-full" onclick={handleDiscard} disabled={isRecovering}>
					Discard and Use Server Version
				</Button>

				<!-- Cancel -->
				<Dialog.Close>
					<Button variant="ghost" class="w-full text-muted-foreground" disabled={isRecovering}>
						Decide Later
					</Button>
				</Dialog.Close>
			</div>

			<!-- Help text -->
			<p class="mt-4 text-xs text-muted-foreground">
				<strong>Restore My Changes</strong>: Uses the locally cached version and syncs it to the
				server.
				<br />
				<strong>Discard</strong>: Deletes local cache and uses the current server version.
				<br />
				<strong>Decide Later</strong>: Keeps the dialog and lets you continue. Recovery will be
				offered again next time.
			</p>
		</Dialog.Content>
	</Dialog.Root>
{/if}
