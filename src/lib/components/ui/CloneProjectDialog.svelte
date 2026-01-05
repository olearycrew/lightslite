<script lang="ts">
	/**
	 * Clone Project Dialog
	 *
	 * Prompts user for a new name when cloning a project.
	 */
	import { Button } from './button';
	import { Input } from './input';
	import { Label } from './label';
	import X from '@lucide/svelte/icons/x';
	import Copy from '@lucide/svelte/icons/copy';

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

	function handleClose() {
		if (isCloning) return;
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		} else if (e.key === 'Enter' && newName.trim() && !isCloning) {
			handleClone();
		}
	}
</script>

{#if open}
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
		role="dialog"
		aria-modal="true"
		aria-labelledby="clone-project-dialog-title"
	>
		<!-- Header -->
		<div class="mb-4 flex items-center justify-between">
			<h2
				id="clone-project-dialog-title"
				class="flex items-center gap-2 text-xl font-semibold text-foreground"
			>
				<Copy class="h-5 w-5" />
				Clone Project
			</h2>
			<Button variant="ghost" size="icon-sm" onclick={handleClose} disabled={isCloning}>
				<X class="h-4 w-4" />
			</Button>
		</div>

		<!-- Description -->
		<p class="mb-4 text-sm text-muted-foreground">
			Create a copy of "{project?.name}". The clone will include all instruments, positions, and
			settings.
		</p>

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
			<div class="flex justify-end gap-3 pt-2">
				<Button variant="outline" onclick={handleClose} disabled={isCloning}>Cancel</Button>
				<Button onclick={handleClone} disabled={isCloning || !newName.trim()}>
					{isCloning ? 'Cloning...' : 'Clone'}
				</Button>
			</div>
		</div>
	</div>
{/if}
