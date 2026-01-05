/**
 * Clone Project Dialog
 * 
 * Prompts user for a new name when cloning a project.
 */
import * as Dialog from '$lib/components/ui/dialog';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import Copy from '@lucide/svelte/icons/copy';

export interface Project {
	id: string;
	name: string;
}

let { open = $bindable(false), project, onClose, onClone }: {
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

function handleOpenChange(value: boolean) {
	open = value;
	if (!value) {
		onClose();
	}
}
</script>

<Dialog.Root open={open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Copy class="h-5 w-5" />
				Clone Project
			</Dialog.Title>
			<Dialog.Description>
				Create a copy of "{project?.name}". The clone will include all instruments, positions, and settings.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="newName">New Project Name</Label>
				<Input
					id="newName"
					bind:value={newName}
					placeholder="Enter project name"
					disabled={isCloning}
					onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleClone()}
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={onClose} disabled={isCloning}>
				Cancel
			</Button>
			<Button onclick={handleClone} disabled={isCloning || !newName.trim()}>
				{isCloning ? 'Cloning...' : 'Clone'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
