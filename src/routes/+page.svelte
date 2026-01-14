<script lang="ts">
	/**
	 * LightsLite - Landing page
	 *
	 * Shows hero section with links to sign in or go to app.
	 * If user is authenticated, shows link to app directly.
	 */
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isAuthenticated = $derived(!!data.session);
</script>

<div class="flex min-h-screen flex-col bg-bg-primary">
	<!-- Hero Section -->
	<section class="relative overflow-hidden">
		<!-- Background gradient effect -->
		<div class="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent"></div>
		<div
			class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 rounded-full blur-3xl"
		></div>

		<div class="relative z-10 mx-auto max-w-5xl px-4 py-20 text-center">
			<!-- Logo/Brand with animation -->
			<div class="mb-8 flex items-center justify-center">
				<div class="relative">
					<div class="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse"></div>
					<h1 class="relative text-5xl md:text-7xl font-bold text-text-primary tracking-tight">
						Lights<span class="text-accent">Lite</span>
					</h1>
				</div>
			</div>

			<p class="mb-6 text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
				Browser-based 2D CAD for Lighting Design. Create professional lighting plots right in your
				browser.
			</p>

			<!-- CTA Buttons -->
			<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center mb-16">
				{#if isAuthenticated}
					<a
						href="/app"
						class="group inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-lg font-medium text-text-primary hover:bg-accent-hover transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
					>
						<svg
							class="h-5 w-5 transition-transform group-hover:translate-x-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 7l5 5m0 0l-5 5m5-5H6"
							/>
						</svg>
						Go to Projects
					</a>
				{:else}
					<a
						href="/auth/sign-in"
						class="group inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-lg font-medium text-text-primary hover:bg-accent-hover transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
					>
						Sign In
						<svg
							class="h-5 w-5 transition-transform group-hover:translate-x-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 8l4 4m0 0l-4 4m4-4H3"
							/>
						</svg>
					</a>
					<a
						href="/auth/sign-up"
						class="inline-flex items-center rounded-lg border-2 border-border px-8 py-4 text-lg font-medium text-text-secondary hover:border-accent hover:text-text-primary hover:bg-accent/5 transition-all duration-200"
					>
						Create Account
					</a>
				{/if}
			</div>

			<!-- Feature highlights -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
				<div
					class="group rounded-xl bg-surface0/50 border border-border/50 p-6 text-left hover:border-accent/50 hover:bg-surface0 transition-all duration-300 hover:-translate-y-1"
				>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-lg font-semibold text-text-primary">Quick & Simple</h3>
					<p class="text-sm text-text-muted">
						Create lighting plots in your browser without complex software or steep learning curve.
					</p>
				</div>

				<div
					class="group rounded-xl bg-surface0/50 border border-border/50 p-6 text-left hover:border-accent/50 hover:bg-surface0 transition-all duration-300 hover:-translate-y-1"
				>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-lg font-semibold text-text-primary">Cloud Storage</h3>
					<p class="text-sm text-text-muted">
						Your projects are saved automatically to the cloud and accessible from anywhere.
					</p>
				</div>

				<div
					class="group rounded-xl bg-surface0/50 border border-border/50 p-6 text-left hover:border-accent/50 hover:bg-surface0 transition-all duration-300 hover:-translate-y-1"
				>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-lg font-semibold text-text-primary">Export Ready</h3>
					<p class="text-sm text-text-muted">
						Export to PDF, SVG, or share with collaborators with one click.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- How it works section -->
	<section class="border-y border-border/50 bg-surface0/20">
		<div class="mx-auto max-w-5xl px-4 py-16">
			<h2 class="mb-12 text-center text-3xl font-bold text-text-primary">How It Works</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl font-bold text-accent"
					>
						1
					</div>
					<h3 class="mb-2 font-medium text-text-primary">Create Project</h3>
					<p class="text-sm text-text-muted">Start a new lighting plot for your venue</p>
				</div>
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl font-bold text-accent"
					>
						2
					</div>
					<h3 class="mb-2 font-medium text-text-primary">Add Positions</h3>
					<p class="text-sm text-text-muted">Place hanging positions and trusses</p>
				</div>
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl font-bold text-accent"
					>
						3
					</div>
					<h3 class="mb-2 font-medium text-text-primary">Add Instruments</h3>
					<p class="text-sm text-text-muted">Place and configure lighting instruments</p>
				</div>
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl font-bold text-accent"
					>
						4
					</div>
					<h3 class="mb-2 font-medium text-text-primary">Export Reports</h3>
					<p class="text-sm text-text-muted">Generate schedules and hookups</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-border bg-surface0/10">
		<div class="mx-auto max-w-5xl px-4 py-12">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
				<!-- Brand -->
				<div class="md:col-span-2">
					<h3 class="mb-4 text-xl font-bold text-text-primary">
						Lights<span class="text-accent">Lite</span>
					</h3>
					<p class="mb-4 text-sm text-text-muted max-w-md">
						Open source lighting design tool built with 💛🖤 in Maryland. Making lighting design
						accessible to everyone.
					</p>
					<p class="text-xs text-text-muted/60">
						Copyright © 2025 Liscio Apps, LLC<br />
						1296 Cronson Blvd Unit 3011, Crofton, MD 21114, United States
					</p>
				</div>

				<!-- Links -->
				<div>
					<h4 class="mb-4 font-medium text-text-primary">Product</h4>
					<nav class="flex flex-col gap-2 text-sm">
						<a href="/auth/sign-up" class="text-text-muted hover:text-accent transition-colors">
							Get Started
						</a>
						<a href="/auth/sign-in" class="text-text-muted hover:text-accent transition-colors">
							Sign In
						</a>
						<a href="/app" class="text-text-muted hover:text-accent transition-colors">
							Projects
						</a>
					</nav>
				</div>

				<!-- Support -->
				<div>
					<h4 class="mb-4 font-medium text-text-primary">Support</h4>
					<nav class="flex flex-col gap-2 text-sm">
						<a
							href="https://github.com/olearycrew/lightslite"
							target="_blank"
							rel="noopener noreferrer"
							class="text-text-muted hover:text-accent transition-colors"
						>
							GitHub
						</a>
						<a
							href="https://github.com/olearycrew/lightslite/issues"
							target="_blank"
							rel="noopener noreferrer"
							class="text-text-muted hover:text-accent transition-colors"
						>
							Report Issue
						</a>
						<a
							href="https://buymeacoffee.com/olearycrew"
							target="_blank"
							rel="noopener noreferrer"
							class="text-text-muted hover:text-accent transition-colors"
						>
							Buy Me a Coffee
						</a>
					</nav>
				</div>
			</div>

			<!-- Bottom bar -->
			<div
				class="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row"
			>
				<div class="flex items-center gap-2 text-xs text-text-muted">
					<span class="text-rosewater">●</span>
					<span class="text-yellow">●</span>
					<span class="text-green">●</span>
					<span>Made with open source software</span>
				</div>
				<div class="flex gap-6 text-xs">
					<a href="/terms" class="text-text-muted hover:text-text-primary transition-colors">
						Terms
					</a>
					<a href="/privacy" class="text-text-muted hover:text-text-primary transition-colors">
						Privacy
					</a>
				</div>
			</div>
		</div>
	</footer>
</div>
