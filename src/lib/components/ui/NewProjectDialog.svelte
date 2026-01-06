<script lang="ts">
	/**
	 * NewProjectDialog - Dialog for creating a new project
	 *
	 * Uses bits-ui Dialog for proper accessibility and focus management.
	 * Provides form fields for:
	 * - Project name (required)
	 * - Scale unit selection (feet/meters)
	 * - Venue name (optional)
	 */
	import * as Dialog from './dialog';
	import { Button } from './button';
	import { Input } from './input';
	import { Label } from './label';
	import * as Select from './select';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	interface Props {
		/** Whether the dialog is open */
		open: boolean;
		/** Callback when project is created successfully */
		onCreate?: (project: {
			id: string;
			name: string;
			updatedAt: string;
			createdAt: string;
			instrumentCount: number;
			positionCount: number;
		}) => void;
		/** Callback when dialog is closed */
		onClose?: () => void;
	}

	let { open = $bindable(false), onCreate, onClose }: Props = $props();

	// Form state
	let projectName = $state('');
	let scaleUnit = $state<'feet' | 'meters'>('feet');
	let venueName = $state('');
	let isCreating = $state(false);
	let error = $state<string | null>(null);

	// Reset form when dialog opens
	$effect(() => {
		if (open) {
			projectName = '';
			scaleUnit = 'feet';
			venueName = '';
			error = null;
		}
	});

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen && !isCreating) {
			open = false;
			onClose?.();
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!projectName.trim()) {
			error = 'Project name is required';
			return;
		}

		isCreating = true;
		error = null;

		try {
			const response = await fetch('/api/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: projectName.trim(),
					scale: { unit: scaleUnit, pixelsPerUnit: 10 },
					venue: venueName.trim() ? { name: venueName.trim() } : null
				})
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error || 'Failed to create project');
			}

			const result = await response.json();

			// Transform the result to match expected format
			onCreate?.({
				id: result.project.id,
				name: result.project.name,
				updatedAt: result.project.updatedAt,
				createdAt: result.project.createdAt,
				instrumentCount: 0,
				positionCount: 0
			});

			open = false;
			onClose?.();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create project';
		} finally {
			isCreating = false;
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-w-md" showClose={!isCreating}>
		<Dialog.Header>
			<Dialog.Title>New Project</Dialog.Title>
			<Dialog.Description>Create a new lighting plot project.</Dialog.Description>
		</Dialog.Header>

		<!-- Form -->
		<form onsubmit={handleSubmit} class="space-y-4">
			<!-- Project Name -->
			<div class="space-y-2">
				<Label for="projectName" class="text-sm font-medium">
					Project Name <span class="text-destructive">*</span>
				</Label>
				<Input
					type="text"
					id="projectName"
					bind:value={projectName}
					placeholder="My Lighting Plot"
					disabled={isCreating}
					class={error && !projectName.trim() ? 'border-destructive' : ''}
				/>
			</div>

			<!-- Scale Unit -->
			<div class="space-y-2">
				<Label for="scaleUnit" class="text-sm font-medium">Scale Unit</Label>
				<Select.Root type="single" bind:value={scaleUnit}>
					<Select.Trigger
						id="scaleUnit"
						class="w-full"
						aria-label="Select scale unit"
						disabled={isCreating}
					>
						{scaleUnit === 'feet' ? 'Feet (US)' : 'Meters (Metric)'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="feet">Feet (US)</Select.Item>
						<Select.Item value="meters">Meters (Metric)</Select.Item>
					</Select.Content>
				</Select.Root>
				<p class="text-xs text-muted-foreground">
					This affects how dimensions are displayed in the editor
				</p>
			</div>

			<!-- Venue Name (Optional) -->
			<div class="space-y-2">
				<Label for="venueName" class="text-sm font-medium">Venue Name (Optional)</Label>
				<Input
					type="text"
					id="venueName"
					bind:value={venueName}
					placeholder="e.g., Main Stage, Theater A"
					disabled={isCreating}
				/>
			</div>

			<!-- Error Message -->
			{#if error}
				<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			{/if}

			<!-- Actions -->
			<Dialog.Footer class="pt-2">
				<Dialog.Close>
					<Button type="button" variant="outline" disabled={isCreating}>Cancel</Button>
				</Dialog.Close>
				<Button type="submit" disabled={isCreating || !projectName.trim()}>
					{#if isCreating}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Creating...
					{:else}
						Create Project
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
