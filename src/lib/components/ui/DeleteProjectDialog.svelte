<script lang="ts">
	/**
	 * DeleteProjectDialog - Confirmation dialog for deleting a project
	 *
	 * Shows warning about permanent deletion and requires confirmation.
	 */
	import { Button } from './button';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	interface ProjectToDelete {
		id: string;
		name: string;
	}

	interface Props {
		/** Whether the dialog is open */
		open: boolean;
		/** Project being deleted */
		project: ProjectToDelete | null;
		/** Callback when project is deleted successfully */
		onDelete?: (projectId: string) => void;
		/** Callback when dialog is closed */
		onClose?: () => void;
	}

	let { open = false, project = null, onDelete, onClose }: Props = $props();

	// Dialog state
	let isDeleting = $state(false);
	let error = $state<string | null>(null);

	// Reset state when dialog opens
	$effect(() => {
		if (open) {
			error = null;
		}
	});

	function handleClose() {
		if (isDeleting) return;
		onClose?.();
	}

	async function handleDelete() {
		if (!project) return;

		isDeleting = true;
		error = null;

		try {
			const response = await fetch(`/api/projects/${project.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error || 'Failed to delete project');
			}

			onDelete?.(project.id);
			onClose?.();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete project';
		} finally {
			isDeleting = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

{#if open && project}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		onclick={handleClose}
		onkeydown={handleKeydown}
		role="presentation"
	></div>

	<!-- Dialog -->
	<div
		class="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg"
		role="alertdialog"
		aria-modal="true"
		aria-labelledby="delete-dialog-title"
		aria-describedby="delete-dialog-description"
	>
		<!-- Warning Icon -->
		<div class="mb-4 flex justify-center">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
				<AlertTriangle class="h-6 w-6 text-destructive" />
			</div>
		</div>

		<!-- Header -->
		<div class="mb-4 text-center">
			<h2 id="delete-dialog-title" class="text-lg font-semibold text-foreground">Delete Project</h2>
			<p id="delete-dialog-description" class="mt-2 text-sm text-muted-foreground">
				Are you sure you want to delete <strong class="text-foreground">{project.name}</strong>?
				This action cannot be undone.
			</p>
		</div>

		<!-- Warning Message -->
		<div class="mb-6 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
			<p class="text-destructive/90">
				<strong>Warning:</strong> All project data including instruments, hanging positions, and annotations
				will be permanently deleted.
			</p>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
				{error}
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex gap-3">
			<Button
				type="button"
				variant="outline"
				class="flex-1"
				onclick={handleClose}
				disabled={isDeleting}
			>
				Cancel
			</Button>
			<Button
				type="button"
				variant="destructive"
				class="flex-1"
				onclick={handleDelete}
				disabled={isDeleting}
			>
				{#if isDeleting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Deleting...
				{:else}
					Delete Project
				{/if}
			</Button>
		</div>
	</div>
{/if}
