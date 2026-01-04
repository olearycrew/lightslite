<script lang="ts">
	/**
	 * ConflictDialog - UI component for handling version conflicts
	 *
	 * Displays when a sync conflict is detected between local and server versions.
	 * Provides options to:
	 * - Keep local changes (will overwrite server)
	 * - Accept server changes (default, server-authoritative)
	 * - View diff between versions
	 */

	import type { ConflictInfo, ConflictResolution, ProjectDiff } from '$lib/sync/conflict.svelte';
	import { Button } from './button';

	// Props
	interface Props {
		/** Whether the dialog is open */
		open: boolean;
		/** Conflict information to display */
		conflictInfo: ConflictInfo | null;
		/** Calculated diff between local and server states */
		diff?: ProjectDiff | null;
		/** Whether a resolution is in progress */
		isResolving?: boolean;
		/** Callback when user selects a resolution */
		onResolve?: (resolution: ConflictResolution) => void;
		/** Callback when dialog is closed/cancelled */
		onClose?: () => void;
	}

	let {
		open = false,
		conflictInfo = null,
		diff = null,
		isResolving = false,
		onResolve,
		onClose
	}: Props = $props();

	// Local state
	let showDiff = $state(false);

	// Format a date for display
	function formatDate(date: Date): string {
		return date.toLocaleString();
	}

	// Handle resolution selection
	function handleResolve(resolution: ConflictResolution) {
		onResolve?.(resolution);
	}

	// Handle dialog close
	function handleClose() {
		showDiff = false;
		onClose?.();
	}

	// Toggle diff view
	function toggleDiff() {
		showDiff = !showDiff;
	}
</script>

{#if open && conflictInfo}
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
		aria-labelledby="conflict-dialog-title"
	>
		<!-- Header -->
		<div class="mb-4">
			<h2 id="conflict-dialog-title" class="text-lg font-semibold text-foreground">
				⚠️ Version Conflict Detected
			</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				The project has been modified on another device or browser tab. Please choose how to resolve
				this conflict.
			</p>
		</div>

		<!-- Conflict Info -->
		<div class="mb-6 space-y-2 rounded-md border border-border bg-muted/50 p-3 text-sm">
			<div class="flex justify-between">
				<span class="text-muted-foreground">Your version:</span>
				<span class="font-mono text-foreground">v{conflictInfo.localVersion}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Server version:</span>
				<span class="font-mono text-foreground">v{conflictInfo.serverVersion}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Detected at:</span>
				<span class="text-foreground">{formatDate(conflictInfo.detectedAt)}</span>
			</div>
		</div>

		<!-- Diff Summary (if available) -->
		{#if diff && showDiff}
			<div class="mb-6 rounded-md border border-border bg-muted/30 p-3">
				<h3 class="mb-2 text-sm font-medium text-foreground">Changes Summary</h3>
				<div class="space-y-1 text-xs">
					{#if diff.summary.totalAdded > 0}
						<div class="text-green-500">+{diff.summary.totalAdded} items added locally</div>
					{/if}
					{#if diff.summary.totalRemoved > 0}
						<div class="text-red-500">-{diff.summary.totalRemoved} items removed locally</div>
					{/if}
					{#if diff.summary.totalModified > 0}
						<div class="text-yellow-500">~{diff.summary.totalModified} items modified</div>
					{/if}
					{#if diff.summary.totalAdded === 0 && diff.summary.totalRemoved === 0 && diff.summary.totalModified === 0}
						<div class="text-muted-foreground">No significant differences detected</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex flex-col gap-3">
			<!-- Primary action: Accept Server (recommended) -->
			<Button
				variant="default"
				class="w-full"
				onclick={() => handleResolve('accept-server')}
				disabled={isResolving}
			>
				{#if isResolving}
					Resolving...
				{:else}
					Accept Server Changes (Recommended)
				{/if}
			</Button>

			<!-- Secondary actions -->
			<div class="flex gap-2">
				<Button
					variant="outline"
					class="flex-1"
					onclick={() => handleResolve('keep-local')}
					disabled={isResolving}
				>
					Keep My Changes
				</Button>

				{#if diff}
					<Button variant="ghost" class="flex-1" onclick={toggleDiff} disabled={isResolving}>
						{showDiff ? 'Hide' : 'View'} Diff
					</Button>
				{/if}
			</div>

			<!-- Cancel -->
			<Button
				variant="ghost"
				class="w-full text-muted-foreground"
				onclick={handleClose}
				disabled={isResolving}
			>
				Cancel (Keep Conflict)
			</Button>
		</div>

		<!-- Help text -->
		<p class="mt-4 text-xs text-muted-foreground">
			<strong>Accept Server Changes</strong>: Discards your local changes and uses the server
			version.
			<br />
			<strong>Keep My Changes</strong>: Overwrites the server with your local changes.
		</p>
	</div>
{/if}
