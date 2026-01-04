<script lang="ts">
	import type { Snippet } from 'svelte';
	/**
	 * App Shell Layout
	 *
	 * Provides the main application chrome including:
	 * - Navigation header
	 * - User menu
	 * - Main content area
	 */
	import type { LayoutData } from './$types';
	import { authClient } from '$lib/auth/client';
	import { goto } from '$app/navigation';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let showUserMenu = $state(false);

	async function handleSignOut() {
		try {
			await authClient.signOut();
			goto('/');
		} catch (error) {
			console.error('Sign out failed:', error);
		}
	}
</script>

<div class="flex min-h-screen flex-col bg-bg-primary">
	<!-- Header -->
	<header class="relative z-50 border-b border-border bg-bg-secondary">
		<div class="flex h-14 items-center justify-between px-4">
			<!-- Logo / Brand -->
			<div class="flex items-center gap-4">
				<a href="/app" class="text-lg font-bold text-text-primary hover:text-accent">
					LightsLite
				</a>
			</div>

			<!-- User Menu -->
			<div class="relative">
				<button
					onclick={() => (showUserMenu = !showUserMenu)}
					class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-primary hover:text-text-primary"
				>
					<div
						class="h-8 w-8 rounded-full bg-blue flex items-center justify-center text-crust font-medium"
					>
						{data.user?.name?.charAt(0).toUpperCase() || 'U'}
					</div>
					<span class="hidden sm:inline">{data.user?.name || 'User'}</span>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{#if showUserMenu}
					<!-- Backdrop -->
					<button
						class="fixed inset-0 z-10"
						onclick={() => (showUserMenu = false)}
						aria-label="Close menu"
					></button>

					<!-- Dropdown -->
					<div
						class="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-border bg-panel py-1 shadow-lg"
					>
						<div class="border-b border-border px-4 py-2 bg-panel">
							<p class="text-sm font-medium text-text-primary">{data.user?.name}</p>
							<p class="text-xs text-text-muted">{data.user?.email}</p>
						</div>
						<button
							onclick={handleSignOut}
							class="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-panel-hover hover:text-text-primary bg-panel"
						>
							Sign out
						</button>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1">
		{@render children()}
	</main>
</div>
