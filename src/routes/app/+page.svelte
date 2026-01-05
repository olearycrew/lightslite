<script lang="ts">
	/**
	 * Project Dashboard Page
	 *
	 * Displays all user's projects with options to create, open, and delete.
	 * Uses shadcn-svelte components and server-side data loading.
	 */
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { NewProjectDialog, DeleteProjectDialog } from '$lib/components/ui';
	import FileText from '@lucide/svelte/icons/file-text';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import Grid2x2 from '@lucide/svelte/icons/grid-2x2';
	import FolderOpen from '@lucide/svelte/icons/folder-open';

	// Server-loaded data
	interface PageData {
		projects: Array<{
			id: string;
			name: string;
			updatedAt: string;
			createdAt: string;
			instrumentCount: number;
			positionCount: number;
			scale: { unit: string; pixelsPerUnit: number } | null;
			venue: { name?: string } | null;
		}>;
	}

	let { data }: { data: PageData } = $props();

	// Local state
	let projects = $state(data.projects);
	let showNewProjectDialog = $state(false);
	let showDeleteDialog = $state(false);
	let projectToDelete = $state<{ id: string; name: string } | null>(null);

	// Handle new project creation
	function handleProjectCreated(project: {
		id: string;
		name: string;
		updatedAt: string;
		createdAt: string;
		instrumentCount: number;
		positionCount: number;
	}) {
		projects = [
			{
				...project,
				scale: null,
				venue: null
			},
			...projects
		];
	}

	// Open delete confirmation
	function handleDeleteClick(e: MouseEvent, project: { id: string; name: string }) {
		e.preventDefault();
		e.stopPropagation();
		projectToDelete = project;
		showDeleteDialog = true;
	}

	// Handle project deletion
	function handleProjectDeleted(projectId: string) {
		projects = projects.filter((p) => p.id !== projectId);
	}

	// Format relative time
	function formatRelativeTime(dateStr: string): string {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	}
</script>

<div class="min-h-screen bg-background p-6">
	<!-- Page Header -->
	<div class="mx-auto mb-8 max-w-6xl">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-foreground">Projects</h1>
				<p class="mt-1 text-muted-foreground">Your lighting plots and designs</p>
			</div>
			<Button size="lg" onclick={() => (showNewProjectDialog = true)}>
				<Plus class="mr-2 h-5 w-5" />
				New Project
			</Button>
		</div>
	</div>

	<!-- Main Content -->
	<div class="mx-auto max-w-6xl">
		{#if projects.length === 0}
			<!-- Empty State -->
			<Card.Root class="border-dashed">
				<Card.Content class="flex flex-col items-center justify-center py-16 text-center">
					<div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
						<FolderOpen class="h-10 w-10 text-primary" strokeWidth={1.5} />
					</div>
					<h2 class="mb-2 text-2xl font-semibold text-foreground">No projects yet</h2>
					<p class="mb-6 max-w-md text-muted-foreground">
						Create your first lighting plot to get started. You can design venues, place
						instruments, and generate professional reports.
					</p>
					<Button size="lg" onclick={() => (showNewProjectDialog = true)}>
						<Plus class="mr-2 h-5 w-5" />
						Create Your First Project
					</Button>
				</Card.Content>
			</Card.Root>
		{:else}
			<!-- Project Grid -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each projects as project (project.id)}
					<a href={`/app/${project.id}`} class="group block">
						<Card.Root
							class="relative h-full transition-all hover:border-primary/50 hover:shadow-lg hover:bg-secondary/20"
						>
							<!-- Delete Button -->
							<button
								onclick={(e) => handleDeleteClick(e, project)}
								class="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
								title="Delete project"
							>
								<Trash2 class="h-4 w-4" />
							</button>

							<!-- Project Thumbnail/Icon Area -->
							<Card.Header class="pb-3">
								<div
									class="flex h-24 w-full items-center justify-center rounded-lg bg-gradient-to-br from-secondary/50 to-secondary"
								>
									<FileText class="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
								</div>
							</Card.Header>

							<!-- Project Info -->
							<Card.Content class="pt-0">
								<Card.Title
									class="mb-1 line-clamp-1 text-lg transition-colors group-hover:text-primary"
								>
									{project.name}
								</Card.Title>

								<!-- Venue if set -->
								{#if project.venue?.name}
									<p class="mb-2 text-sm text-muted-foreground">{project.venue.name}</p>
								{/if}

								<!-- Stats Row -->
								<div class="flex items-center gap-4 text-xs text-muted-foreground">
									<div class="flex items-center gap-1" title="Instruments">
										<Lightbulb class="h-3.5 w-3.5" />
										<span>{project.instrumentCount}</span>
									</div>
									<div class="flex items-center gap-1" title="Hanging Positions">
										<Grid2x2 class="h-3.5 w-3.5" />
										<span>{project.positionCount}</span>
									</div>
								</div>
							</Card.Content>

							<!-- Footer with timestamp -->
							<Card.Footer class="border-t border-border/50 pt-3">
								<span class="text-xs text-muted-foreground">
									Updated {formatRelativeTime(project.updatedAt)}
								</span>
							</Card.Footer>
						</Card.Root>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- New Project Dialog -->
<NewProjectDialog
	open={showNewProjectDialog}
	onClose={() => (showNewProjectDialog = false)}
	onCreate={handleProjectCreated}
/>

<!-- Delete Project Dialog -->
<DeleteProjectDialog
	open={showDeleteDialog}
	project={projectToDelete}
	onClose={() => {
		showDeleteDialog = false;
		projectToDelete = null;
	}}
	onDelete={handleProjectDeleted}
/>
