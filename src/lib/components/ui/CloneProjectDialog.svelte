<script lang="ts">
	/**
	 * Clone Project Dialog
	 *
	 * Uses bits-ui Dialog for proper accessibility and focus management.
	 * Prompts user for a new name when cloning a project.
	 */
	import * as Dialog from './dialog';
	import { Button } from './button';
	import { Input } from './input';
	import { Label } from './label';
	import Copy from '@lucide/svelte/icons/copy';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	export interface Project {
		id: string;
		name: string;
	}

	let {
		open = $bindable(false),
		project,
		onClose,
		onClone
	}: {
		open: boolean;
		project: Project | null;
		onClose: () => void;
		onClone: (id: string, newName: string) => void;
	} = $props();

	// Local state for the new project name
	let newName = $state('');
	let isCloning = $state(false);

	// Update new name when project changes
	$effect(() => {
		if (project) {
			newName = `${project.name} (Copy)`;
		}
	});

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen && !isCloning) {
			open = false;
			onClose();
		}
	}

	async function handleClone() {
		if (!project || !newName.trim()) return;

		isCloning = true;
		try {
			await onClone(project.id, newName.trim());
			open = false;
		} finally {
			isCloning = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && newName.trim() && !isCloning) {
			handleClone();
		}
	}
</script>

{#if project}
	<Dialog.Root bind:open onOpenChange={handleOpenChange}>
		<Dialog.Content class="max-w-md" showClose={!isCloning}>
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					<Copy class="h-5 w-5" />
					Clone Project
				</Dialog.Title>
				<Dialog.Description>
					Create a copy of "{project.name}". The clone will include all instruments, positions, and
					settings.
				</Dialog.Description>
			</Dialog.Header>

			<!-- Form -->
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="newName" class="text-sm font-medium">New Project Name</Label>
					<Input
						id="newName"
						bind:value={newName}
						placeholder="Enter project name"
						disabled={isCloning}
						onkeydown={handleKeydown}
					/>
				</div>

				<!-- Actions -->
				<Dialog.Footer class="pt-2">
					<Dialog.Close>
						<Button variant="outline" disabled={isCloning}>Cancel</Button>
					</Dialog.Close>
					<Button onclick={handleClone} disabled={isCloning || !newName.trim()}>
						{#if isCloning}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Cloning...
						{:else}
							Clone
						{/if}
					</Button>
				</Dialog.Footer>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}
