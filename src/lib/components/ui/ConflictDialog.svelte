<script lang="ts">
	/**
	 * ConflictDialog - UI component for handling version conflicts
	 *
	 * Uses bits-ui Dialog for proper accessibility and focus management.
	 * Displays when a sync conflict is detected between local and server versions.
	 * Provides options to:
	 * - Keep local changes (will overwrite server)
	 * - Accept server changes (default, server-authoritative)
	 * - View diff between versions
	 */
	import * as Dialog from './dialog';
	import type { ConflictInfo, ConflictResolution, ProjectDiff } from '$lib/sync/conflict.svelte';
	import { Button } from './button';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Loader2 from '@lucide/svelte/icons/loader-2';

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
		open = $bindable(false),
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
	function handleOpenChange(isOpen: boolean) {
		if (!isOpen && !isResolving) {
			showDiff = false;
			open = false;
			onClose?.();
		}
	}

	// Toggle diff view
	function toggleDiff() {
		showDiff = !showDiff;
	}
</script>

{#if conflictInfo}
	<Dialog.Root bind:open onOpenChange={handleOpenChange}>
		<Dialog.Content class="max-w-lg" showClose={!isResolving}>
			<!-- Warning Icon -->
			<div class="mb-4 flex justify-center">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
					<AlertTriangle class="h-6 w-6 text-yellow-500" />
				</div>
			</div>

			<Dialog.Header>
				<Dialog.Title>Version Conflict Detected</Dialog.Title>
				<Dialog.Description>
					The project has been modified on another device or browser tab. Please choose how to
					resolve this conflict.
				</Dialog.Description>
			</Dialog.Header>

			<!-- Conflict Info -->
			<div class="mb-4 space-y-2 rounded-md border border-border bg-muted/50 p-3 text-sm">
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
				<div class="mb-4 rounded-md border border-border bg-muted/30 p-3">
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
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
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
				<Dialog.Close>
					<Button variant="ghost" class="w-full text-muted-foreground" disabled={isResolving}>
						Cancel (Keep Conflict)
					</Button>
				</Dialog.Close>
			</div>

			<!-- Help text -->
			<p class="mt-4 text-xs text-muted-foreground">
				<strong>Accept Server Changes</strong>: Discards your local changes and uses the server
				version.
				<br />
				<strong>Keep My Changes</strong>: Overwrites the server with your local changes.
			</p>
		</Dialog.Content>
	</Dialog.Root>
{/if}
