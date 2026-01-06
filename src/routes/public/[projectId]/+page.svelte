<script lang="ts">
	/**
	 * Public Project View Page
	 *
	 * View-only mode for projects without authentication.
	 * Displays project information and a read-only plot overview.
	 */
	import type { PageData } from './$types';

	interface ProjectData {
		id: string;
		name: string;
		venue?: Record<string, unknown> | null;
		scale?: Record<string, unknown> | null;
		layers?: Record<string, unknown> | null;
		createdAt?: string;
		updatedAt?: string;
	}

	interface LayerData {
		instruments?: Array<Record<string, unknown>>;
		hangingPositions?: Array<Record<string, unknown>>;
		shapes?: Array<Record<string, unknown>>;
		setPieces?: Array<Record<string, unknown>>;
		annotations?: Array<Record<string, unknown>>;
	}

	let { data }: { data: PageData } = $props();

	// Project data with proper typing
	let project = $derived<ProjectData>(
		(data.project ?? {
			id: '',
			name: 'Unknown Project',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			layers: {}
		}) as unknown as ProjectData
	);
	let layers = $derived<LayerData>((project.layers || {}) as LayerData);
	let scale = $derived(
		(project.scale || { unit: 'feet', pixelsPerUnit: 10 }) as {
			unit: string;
			pixelsPerUnit: number;
		}
	);
	let venue = $derived(project.venue as Record<string, unknown> | null | undefined);

	// Format date
	let updatedAt = $derived(
		project.updatedAt
			? new Date(project.updatedAt).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				})
			: 'Unknown'
	);

	// Generate shareable link
	let shareUrl = $derived(typeof window !== 'undefined' ? window.location.href : '');

	// Type guards for shape geometry
	function isRectGeom(
		geom: Record<string, unknown>
	): geom is { type: 'rect'; x: number; y: number; width: number; height: number } {
		return geom.type === 'rect';
	}
	function isCircleGeom(
		geom: Record<string, unknown>
	): geom is { type: 'circle'; cx: number; cy: number; radius: number } {
		return geom.type === 'circle';
	}
	function isLineGeom(
		geom: Record<string, unknown>
	): geom is { type: 'line'; x1: number; y1: number; x2: number; y2: number } {
		return geom.type === 'line';
	}

	// Helper to get number values safely
	function getNum(val: unknown, defaultVal = 0): number {
		return typeof val === 'number' ? val : defaultVal;
	}
</script>

<svelte:head>
	<title>{project.name} - Public View | LightsLite</title>
</svelte:head>

<div class="min-h-screen bg-muted/30">
	<!-- Header -->
	<header class="border-b bg-white shadow-sm">
		<div class="container mx-auto flex items-center justify-between px-4 py-4">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold"
				>
					L
				</div>
				<div>
					<h1 class="text-xl font-semibold">{project.name}</h1>
					<p class="text-sm text-muted-foreground">Public Plot View</p>
				</div>
			</div>
			<div class="flex items-center gap-4">
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100"
				>
					<span class="h-2 w-2 rounded-full bg-green-500"></span>
					Public Access
				</span>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Left Column: Project Info -->
			<div class="space-y-6">
				<!-- Project Details Card -->
				<div class="rounded-lg border bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-lg font-semibold">Project Details</h2>
					<dl class="space-y-3">
						<div class="flex justify-between">
							<dt class="text-muted-foreground">Venue</dt>
							<dd class="font-medium">{venue?.name || 'Not specified'}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-muted-foreground">Scale</dt>
							<dd class="font-medium">{scale.unit === 'meters' ? 'Metric' : 'Imperial'}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-muted-foreground">Last Updated</dt>
							<dd class="font-medium">{updatedAt}</dd>
						</div>
					</dl>
				</div>

				<!-- Object Count Card -->
				<div class="rounded-lg border bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-lg font-semibold">Plot Contents</h2>
					<div class="grid grid-cols-2 gap-4">
						<div class="rounded-lg bg-muted/50 p-4 text-center">
							<div class="text-3xl font-bold">{layers.instruments?.length || 0}</div>
							<div class="text-sm text-muted-foreground">Instruments</div>
						</div>
						<div class="rounded-lg bg-muted/50 p-4 text-center">
							<div class="text-3xl font-bold">{layers.hangingPositions?.length || 0}</div>
							<div class="text-sm text-muted-foreground">Positions</div>
						</div>
						<div class="rounded-lg bg-muted/50 p-4 text-center">
							<div class="text-3xl font-bold">{layers.shapes?.length || 0}</div>
							<div class="text-sm text-muted-foreground">Shapes</div>
						</div>
						<div class="rounded-lg bg-muted/50 p-4 text-center">
							<div class="text-3xl font-bold">
								{(layers.setPieces?.length || 0) + (layers.annotations?.length || 0)}
							</div>
							<div class="text-sm text-muted-foreground">Other</div>
						</div>
					</div>
				</div>

				<!-- Share Card -->
				<div class="rounded-lg border bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-lg font-semibold">Share This Plot</h2>
					<p class="mb-4 text-sm text-muted-foreground">
						Copy this link to share your plot with anyone, even without an account.
					</p>
					<div class="flex gap-2">
						<input
							type="text"
							readonly
							value={shareUrl}
							class="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm"
						/>
						<button
							class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
							onclick={() => {
								navigator.clipboard.writeText(shareUrl);
							}}
						>
							Copy
						</button>
					</div>
				</div>
			</div>

			<!-- Right Column: Plot Preview -->
			<div class="lg:col-span-2">
				<div class="rounded-lg border bg-white p-6 shadow-sm">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-lg font-semibold">Plot Preview</h2>
						<a href="/auth/sign-in" class="text-sm font-medium text-primary hover:underline">
							Sign in to edit →
						</a>
					</div>

					<!-- Preview Area -->
					<div class="relative aspect-video w-full overflow-hidden rounded-lg bg-muted/50">
						{#if layers.instruments?.length || layers.hangingPositions?.length || layers.shapes?.length}
							<!-- Simple SVG preview -->
							<svg viewBox="-500 -300 1000 600" class="h-full w-full">
								<!-- Grid background -->
								<defs>
									<pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
										<path
											d="M 50 0 L 0 0 0 50"
											fill="none"
											stroke="currentColor"
											stroke-width="0.5"
											class="text-muted"
										/>
									</pattern>
								</defs>
								<rect x="-500" y="-300" width="1000" height="600" fill="url(#grid)" />

								<!-- Center line -->
								<line x1="0" y1="-300" x2="0" y2="600" stroke="#a6e3a1" stroke-width="2" />

								<!-- Plaster line -->
								<line x1="-500" y1="0" x2="1000" y2="0" stroke="#f5c2e7" stroke-width="2" />

								<!-- Shapes -->
								{#each layers.shapes || [] as shape (shape.id)}
									{@const geom = shape.geometry as Record<string, unknown>}
									{#if isRectGeom(geom)}
										<rect
											x={geom.x}
											y={geom.y}
											width={geom.width}
											height={geom.height}
											fill="none"
											stroke="#45475a"
											stroke-width="2"
											class="opacity-60"
										/>
									{:else if isCircleGeom(geom)}
										<circle
											cx={geom.cx}
											cy={geom.cy}
											r={geom.radius}
											fill="none"
											stroke="#45475a"
											stroke-width="2"
											class="opacity-60"
										/>
									{:else if isLineGeom(geom)}
										<line
											x1={geom.x1}
											y1={geom.y1}
											x2={geom.x2}
											y2={geom.y2}
											stroke="#45475a"
											stroke-width="2"
											class="opacity-60"
										/>
									{/if}
								{/each}

								<!-- Hanging Positions -->
								{#each layers.hangingPositions || [] as hp (hp.id)}
									<line
										x1={getNum(hp.x1)}
										y1={getNum(hp.y1)}
										x2={getNum(hp.x2)}
										y2={getNum(hp.y2)}
										stroke="#89b4fa"
										stroke-width="6"
										stroke-linecap="round"
									/>
								{/each}

								<!-- Instruments -->
								{#each layers.instruments || [] as inst (inst.id)}
									{@const size = 24}
									{@const hp = layers.hangingPositions?.find(
										(h) => h.id === inst.hangingPositionId
									)}
									{@const x = hp
										? getNum(hp.x1) + (getNum(hp.x2) - getNum(hp.x1)) * getNum(inst.positionOnBar)
										: getNum(inst.x)}
									{@const y = hp
										? getNum(hp.y1) + (getNum(hp.y2) - getNum(hp.y1)) * getNum(inst.positionOnBar)
										: getNum(inst.y)}
									<g transform="translate({x}, {y})">
										<rect
											x={-size / 2}
											y={-size / 2}
											width={size}
											height={size}
											fill="#f9e2af"
											stroke="#333"
											stroke-width="1"
											rx="2"
										/>
										<text
											x="0"
											y="4"
											text-anchor="middle"
											class="text-[10px] fill-current font-mono"
										>
											{inst.channel || '?'}
										</text>
									</g>
								{/each}
							</svg>
						{:else}
							<div class="flex h-full items-center justify-center text-muted-foreground">
								<div class="text-center">
									<p class="text-lg font-medium">Empty Plot</p>
									<p class="text-sm">Sign in to add instruments and positions</p>
								</div>
							</div>
						{/if}
					</div>

					<p class="mt-4 text-center text-sm text-muted-foreground">
						This is a read-only preview. Sign in to access the full editor.
					</p>
				</div>
			</div>
		</div>
	</main>
</div>
