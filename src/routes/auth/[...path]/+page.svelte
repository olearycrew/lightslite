<script lang="ts">
	/**
	 * Auth pages - Sign In, Sign Up, and related forms
	 *
	 * Uses Neon Auth client for authentication flows.
	 * Redirects to /app after successful authentication.
	 */
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth/client';

	// Get the current auth path (sign-in, sign-up, etc.)
	let authPath = $derived($page.params.path || 'sign-in');
	let isSignUp = $derived(authPath === 'sign-up');

	// Form state
	let email = $state('');
	let password = $state('');
	let name = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		error = '';

		try {
			if (isSignUp) {
				// Sign up flow
				// @ts-expect-error - Neon Auth client types are complex through Proxy
				const result = await authClient.signUp.email({
					email,
					password,
					name
				});
				if (result.error) {
					error = result.error.message || 'Sign up failed';
					return;
				}
			} else {
				// Sign in flow
				// @ts-expect-error - Neon Auth client types are complex through Proxy
				const result = await authClient.signIn.email({
					email,
					password
				});
				if (result.error) {
					error = result.error.message || 'Sign in failed';
					return;
				}
			}

			// Redirect to app on success
			goto('/app');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Authentication failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-bg-primary">
	<div class="w-full max-w-md">
		<!-- Logo / Header -->
		<div class="mb-8 text-center">
			<a href="/" class="inline-block">
				<h1 class="text-2xl font-bold text-text-primary">LightsLite</h1>
			</a>
			<p class="mt-2 text-text-secondary">
				{isSignUp ? 'Create your account' : 'Sign in to your account'}
			</p>
		</div>

		<!-- Auth Form -->
		<div class="panel p-6">
			<form onsubmit={handleSubmit} class="space-y-4">
				{#if error}
					<div class="rounded bg-red-900/20 border border-red-500/30 p-3 text-sm text-red-400">
						{error}
					</div>
				{/if}

				{#if isSignUp}
					<div>
						<label for="name" class="mb-1 block text-sm font-medium text-text-secondary">
							Name
						</label>
						<input
							type="text"
							id="name"
							bind:value={name}
							required
							class="w-full rounded border border-border bg-bg-secondary px-3 py-2 text-text-primary placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							placeholder="Your name"
						/>
					</div>
				{/if}

				<div>
					<label for="email" class="mb-1 block text-sm font-medium text-text-secondary">
						Email
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						class="w-full rounded border border-border bg-bg-secondary px-3 py-2 text-text-primary placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						placeholder="you@example.com"
					/>
				</div>

				<div>
					<label for="password" class="mb-1 block text-sm font-medium text-text-secondary">
						Password
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						required
						minlength="8"
						class="w-full rounded border border-border bg-bg-secondary px-3 py-2 text-text-primary placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded bg-accent py-2 font-medium text-text-primary hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50"
				>
					{#if loading}
						<span class="inline-flex items-center">
							<svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
									fill="none"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							Processing...
						</span>
					{:else}
						{isSignUp ? 'Create Account' : 'Sign In'}
					{/if}
				</button>
			</form>

			<!-- Toggle between sign in / sign up -->
			<div class="mt-4 text-center text-sm text-text-secondary">
				{#if isSignUp}
					Already have an account?
					<a href="/auth/sign-in" class="text-accent hover:text-accent-hover"> Sign in </a>
				{:else}
					Don't have an account?
					<a href="/auth/sign-up" class="text-accent hover:text-accent-hover"> Sign up </a>
				{/if}
			</div>
		</div>

		<!-- Back to home -->
		<div class="mt-4 text-center">
			<a href="/" class="text-sm text-text-muted hover:text-text-secondary"> ← Back to home </a>
		</div>
	</div>
</div>
