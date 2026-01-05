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

<div class="flex min-h-screen flex-col items-center justify-center bg-bg-primary">
	<div class="w-full max-w-2xl px-4 text-center">
		<!-- Hero Section -->
		<div class="mb-8">
			<h1 class="mb-4 text-4xl font-bold text-text-primary">LightsLite</h1>
			<p class="text-xl text-text-secondary">Browser-based 2D CAD for Lighting Design</p>
		</div>

		<!-- Feature highlights -->
		<div class="panel mb-8 p-6">
			<div class="grid grid-cols-1 gap-4 text-left md:grid-cols-3">
				<div class="rounded-lg bg-bg-secondary p-4">
					<h3 class="mb-2 font-medium text-text-primary">Quick & Simple</h3>
					<p class="text-sm text-text-secondary">
						Create lighting plots in your browser without complex software
					</p>
				</div>
				<div class="rounded-lg bg-bg-secondary p-4">
					<h3 class="mb-2 font-medium text-text-primary">Cloud Storage</h3>
					<p class="text-sm text-text-secondary">
						Your projects are saved automatically and accessible anywhere
					</p>
				</div>
				<div class="rounded-lg bg-bg-secondary p-4">
					<h3 class="mb-2 font-medium text-text-primary">Export Ready</h3>
					<p class="text-sm text-text-secondary">Export to PDF, SVG, or share with collaborators</p>
				</div>
			</div>
		</div>

		<!-- CTA Buttons -->
		<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
			{#if isAuthenticated}
				<a
					href="/app"
					class="inline-flex items-center rounded bg-accent px-6 py-3 font-medium text-text-primary hover:bg-accent-hover transition-colors"
				>
					<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					Go to Projects
				</a>
			{:else}
				<a
					href="/auth/sign-in"
					class="inline-flex items-center rounded bg-accent px-6 py-3 font-medium text-text-primary hover:bg-accent-hover transition-colors"
				>
					Sign In
				</a>
				<a
					href="/auth/sign-up"
					class="inline-flex items-center rounded border border-border px-6 py-3 font-medium text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
				>
					Create Account
				</a>
			{/if}
		</div>

		<!-- Footer -->
		<footer class="mt-12 border-t border-border pt-6">
			<div class="flex flex-col items-center gap-6">
				<!-- Made with Love -->
				<p class="text-sm text-text-secondary">
					Made with <span class="text-yellow-500">❤️</span><span class="text-black">🖤</span> in Maryland
				</p>

				<!-- Links -->
				<nav class="flex flex-wrap justify-center gap-4">
					<a
						href="https://github.com/olearycrew/lightslite"
						target="_blank"
						rel="noopener noreferrer"
						class="text-xs text-text-muted hover:text-text-primary transition-colors"
					>
						GitHub
					</a>
					<a
						href="https://buymeacoffee.com/olearycrew"
						target="_blank"
						rel="noopener noreferrer"
						class="text-xs text-accent hover:text-accent-hover transition-colors"
					>
						Buy Me a Coffee ☕
					</a>
					<a
						href="/terms"
						class="text-xs text-text-muted hover:text-text-primary transition-colors"
					>
						Terms
					</a>
					<a
						href="/privacy"
						class="text-xs text-text-muted hover:text-text-primary transition-colors"
					>
						Privacy
					</a>
					<a
						href="https://github.com/olearycrew/lightslite/issues"
						target="_blank"
						rel="noopener noreferrer"
						class="text-xs text-text-muted hover:text-text-primary transition-colors"
					>
						Feedback
					</a>
				</nav>

				<!-- Copyright -->
				<div class="text-center text-xs text-text-muted">
					<p>Copyright © 2026 Liscio Apps, LLC</p>
					<p class="mt-1">1296 Cronson Blvd Unit 3011, Crofton, MD 21114, United States</p>
				</div>

				<!-- Open Source -->
				<p class="text-xs text-text-muted">Open source lighting design tool</p>
			</div>
		</footer>
	</div>
</div>
