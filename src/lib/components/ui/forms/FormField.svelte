<script lang="ts">
	/**
	 * FormField Component
	 *
	 * A label + input wrapper with consistent styling.
	 * Supports both horizontal and vertical layouts.
	 * Built with shadcn-svelte Label component.
	 */
	import { Label } from '$lib/components/ui/label';

	interface Props {
		label: string;
		id?: string;
		layout?: 'horizontal' | 'vertical';
		hint?: string;
		class?: string;
		children: import('svelte').Snippet;
	}

	let {
		label,
		id = '',
		layout = 'horizontal',
		hint = '',
		class: className = '',
		children
	}: Props = $props();
</script>

<div
	class="flex gap-2 {layout === 'horizontal'
		? 'flex-row items-center justify-between'
		: 'flex-col items-stretch'} {className}"
>
	<Label
		for={id || undefined}
		class="text-xs text-muted-foreground whitespace-nowrap shrink-0 {layout === 'horizontal'
			? 'min-w-[80px]'
			: ''}"
	>
		{label}
		{#if hint}
			<span class="block text-[10px] text-muted-foreground/70 font-normal">
				{hint}
			</span>
		{/if}
	</Label>
	<div class="flex-1 min-w-0 {layout === 'horizontal' ? 'max-w-[140px]' : ''}">
		{@render children()}
	</div>
</div>
