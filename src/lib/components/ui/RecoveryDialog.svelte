<script lang="ts">
	/**
	 * RecoveryDialog - UI component for crash recovery
	 *
	 * Displays when unsaved changes are detected from a previous session.
	 * Provides options to:
	 * - Restore from cached IndexedDB data
	 * - Discard local changes and use server version
	 */

	import type { RecoveryInfo } from '$lib/sync/indexeddb';
	import { Button } from './button';

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
		open = false,
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
	function handleClose() {
		onClose?.();
	}
</script>

{#if open && recoveryInfo}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		onclick={handleClose}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
		role="presentation"
	></div>

	<!-- Dialog -->
	<div
		class="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg"
		role="dialog"
		aria-modal="true"
		aria-labelledby="recovery-dialog-title"
	>
		<!-- Header -->
		<div class="mb-4">
			<h2 id="recovery-dialog-title" class="text-lg font-semibold text-foreground">
				🔄 Recover Unsaved Changes?
			</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				We found unsaved changes from a previous session. Would you like to restore them?
			</p>
		</div>

		<!-- Recovery Info -->
		<div class="mb-6 space-y-2 rounded-md border border-border bg-muted/50 p-3 text-sm">
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
		<div class="mb-6 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
			<div class="flex items-start gap-2">
				<span class="text-yellow-500">⚠️</span>
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
			<Button
				variant="ghost"
				class="w-full text-muted-foreground"
				onclick={handleClose}
				disabled={isRecovering}
			>
				Decide Later
			</Button>
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
	</div>
{/if}
