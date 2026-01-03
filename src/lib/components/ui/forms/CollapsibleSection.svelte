<script lang="ts">
	/**
	 * CollapsibleSection Component
	 *
	 * A collapsible section with header and content.
	 */

	interface Props {
		title: string;
		defaultOpen?: boolean;
		children: import('svelte').Snippet;
	}

	let { title, defaultOpen = true, children }: Props = $props();

	let isOpen = $state(defaultOpen);
</script>

<div class="collapsible-section" class:open={isOpen}>
	<button type="button" class="section-header" onclick={() => (isOpen = !isOpen)}>
		<span class="chevron">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<polyline
					points="6 9 12 15 18 9"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</span>
		<span class="section-title">{title}</span>
	</button>

	{#if isOpen}
		<div class="section-content">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.collapsible-section {
		border-bottom: 1px solid var(--color-border, #444);
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 12px 16px;
		background: none;
		border: none;
		color: var(--color-text-primary, #fff);
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		cursor: pointer;
		text-align: left;
	}

	.section-header:hover {
		background: var(--color-bg-hover, rgba(255, 255, 255, 0.05));
	}

	.chevron {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s ease;
		transform: rotate(-90deg);
	}

	.chevron svg {
		width: 12px;
		height: 12px;
	}

	.open .chevron {
		transform: rotate(0deg);
	}

	.section-title {
		flex: 1;
	}

	.section-content {
		padding: 0 16px 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
</style>
