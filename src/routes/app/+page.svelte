<script lang="ts">
	/**
	 * Project List Page
	 *
	 * Shows all user's projects with options to create new ones.
	 * Placeholder UI - will be connected to API later.
	 */

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
			<h1 class="text-2xl font-bold text-text-primary">Projects</h1>
			<p class="text-text-secondary">Your lighting plots and designs</p>
		</div>
		<button onclick={() => (showNewProjectModal = true)} class="btn-primary">
			<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			New Project
		</button>
	</div>

	<!-- Projects Grid -->
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-text-muted">Loading projects...</div>
		</div>
	{:else if projects.length === 0}
		<!-- Empty State -->
		<div class="panel flex flex-col items-center justify-center py-12 text-center">
			<svg
				class="mb-4 h-16 w-16 text-text-muted"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<h2 class="mb-2 text-xl font-medium text-text-primary">No projects yet</h2>
			<p class="mb-4 text-text-secondary">Create your first lighting plot to get started</p>
			<button onclick={() => (showNewProjectModal = true)} class="btn-primary">
				<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				Create Project
			</button>
		</div>
	{:else}
		<!-- Project Cards -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each projects as project (project.id)}
				<a href={`/app/${project.id}`} class="panel group p-4 transition-all hover:border-accent">
					<div class="mb-3 flex items-start justify-between">
						<div class="h-10 w-10 rounded bg-bg-secondary flex items-center justify-center">
							<svg
								class="h-6 w-6 text-text-muted"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
					</div>
					<h3 class="font-medium text-text-primary group-hover:text-accent">{project.name}</h3>
					<p class="mt-1 text-xs text-text-muted">
						Updated {new Date(project.updatedAt).toLocaleDateString()}
					</p>
				</a>
			{/each}
		</div>
	{/if}
</div>

<!-- New Project Modal -->
{#if showNewProjectModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="panel w-full max-w-md p-6">
			<h2 class="mb-4 text-xl font-bold text-text-primary">New Project</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					createProject();
				}}
			>
				<div class="mb-4">
					<label for="projectName" class="mb-1 block text-sm font-medium text-text-secondary">
						Project Name
					</label>
					<input
						type="text"
						id="projectName"
						bind:value={newProjectName}
						required
						class="w-full rounded border border-border bg-bg-secondary px-3 py-2 text-text-primary placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						placeholder="My Lighting Plot"
					/>
				</div>
				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={() => {
							showNewProjectModal = false;
							newProjectName = '';
						}}
						class="btn-secondary"
					>
						Cancel
					</button>
					<button type="submit" class="btn-primary"> Create </button>
				</div>
			</form>
		</div>
	</div>
{/if}
