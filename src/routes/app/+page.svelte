<script lang="ts">
	/**
	 * Project List Page
	 *
	 * Shows all user's projects with options to create new ones.
	 * Uses shadcn-svelte components for consistent UI.
	 */
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import FileText from '@lucide/svelte/icons/file-text';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';

	// Placeholder projects for UI demonstration
	let projects = $state<Array<{ id: string; name: string; updatedAt: string }>>([]);
	let loading = $state(false);
	let showNewProjectModal = $state(false);
	let newProjectName = $state('');

	async function loadProjects() {
		loading = true;
		try {
			const response = await fetch('/api/projects');
			if (response.ok) {
				const result = await response.json();
				projects = result.projects || [];
			}
		} catch (error) {
			console.error('Failed to load projects:', error);
		} finally {
			loading = false;
		}
	}

	async function createProject() {
		if (!newProjectName.trim()) return;

		try {
			const response = await fetch('/api/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newProjectName })
			});

			if (response.ok) {
				const result = await response.json();
				projects = [result.project, ...projects];
				showNewProjectModal = false;
				newProjectName = '';
			}
		} catch (error) {
			console.error('Failed to create project:', error);
		}
	}

	// Load projects on mount
	$effect(() => {
		loadProjects();
	});
</script>

<div class="p-6">
	<!-- Page Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Projects</h1>
			<p class="text-muted-foreground">Your lighting plots and designs</p>
		</div>
		<Button onclick={() => (showNewProjectModal = true)}>
			<Plus class="mr-2 h-4 w-4" />
			New Project
		</Button>
	</div>

	<!-- Projects Grid -->
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading projects...</div>
		</div>
	{:else if projects.length === 0}
		<!-- Empty State -->
		<Card.Root class="flex flex-col items-center justify-center py-12 text-center">
			<Card.Content class="flex flex-col items-center">
				<FileText class="mb-4 h-16 w-16 text-muted-foreground" strokeWidth={1.5} />
				<h2 class="mb-2 text-xl font-medium text-foreground">No projects yet</h2>
				<p class="mb-4 text-muted-foreground">Create your first lighting plot to get started</p>
				<Button onclick={() => (showNewProjectModal = true)}>
					<Plus class="mr-2 h-4 w-4" />
					Create Project
				</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Project Cards -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each projects as project (project.id)}
				<a href={`/app/${project.id}`} class="block group">
					<Card.Root
						class="h-full transition-all hover:border-primary/50 hover:shadow-md hover:bg-secondary/30"
					>
						<Card.Header class="pb-2">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
								<FileText class="h-5 w-5 text-muted-foreground" />
							</div>
						</Card.Header>
						<Card.Content class="pt-0">
							<Card.Title class="group-hover:text-primary transition-colors">
								{project.name}
							</Card.Title>
							<Card.Description>
								Updated {new Date(project.updatedAt).toLocaleDateString()}
							</Card.Description>
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>
	{/if}
</div>

<!-- New Project Modal -->
{#if showNewProjectModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<Card.Root class="w-full max-w-md">
			<Card.Header>
				<div class="flex items-center justify-between">
					<Card.Title class="text-xl">New Project</Card.Title>
					<Button
						variant="ghost"
						size="icon-sm"
						onclick={() => {
							showNewProjectModal = false;
							newProjectName = '';
						}}
					>
						<X class="h-4 w-4" />
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				<form
					onsubmit={(e) => {
						e.preventDefault();
						createProject();
					}}
				>
					<div class="mb-4">
						<Label for="projectName" class="mb-2 block">Project Name</Label>
						<Input
							type="text"
							id="projectName"
							bind:value={newProjectName}
							required
							placeholder="My Lighting Plot"
						/>
					</div>
					<div class="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onclick={() => {
								showNewProjectModal = false;
								newProjectName = '';
							}}
						>
							Cancel
						</Button>
						<Button type="submit">Create</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	</div>
{/if}
