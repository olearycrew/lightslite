<script lang="ts">
	/**
	 * DeleteProjectDialog - Confirmation dialog for deleting a project
	 *
	 * Uses bits-ui AlertDialog for proper accessibility and focus management.
	 * Shows warning about permanent deletion and requires confirmation.
	 */
	import * as Dialog from './dialog';
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

	let { open = $bindable(false), project = null, onDelete, onClose }: Props = $props();

	// Dialog state
	let isDeleting = $state(false);
	let error = $state<string | null>(null);

	// Reset state when dialog opens
	$effect(() => {
		if (open) {
			error = null;
		}
	});

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen && !isDeleting) {
			open = false;
			onClose?.();
		}
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
			open = false;
			onClose?.();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete project';
		} finally {
			isDeleting = false;
		}
	}
</script>

{#if project}
	<Dialog.Root bind:open onOpenChange={handleOpenChange}>
		<Dialog.Content class="max-w-md" showClose={!isDeleting}>
			<!-- Warning Icon -->
			<div class="mb-4 flex justify-center">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
					<AlertTriangle class="h-6 w-6 text-destructive" />
				</div>
			</div>

			<Dialog.Header class="text-center">
				<Dialog.Title>Delete Project</Dialog.Title>
				<Dialog.Description>
					Are you sure you want to delete <strong class="text-foreground">{project.name}</strong>?
					This action cannot be undone.
				</Dialog.Description>
			</Dialog.Header>

			<!-- Warning Message -->
			<div class="mb-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
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
			<Dialog.Footer class="flex-row gap-3">
				<Dialog.Close class="flex-1">
					<Button type="button" variant="outline" class="w-full" disabled={isDeleting}>
						Cancel
					</Button>
				</Dialog.Close>
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
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
