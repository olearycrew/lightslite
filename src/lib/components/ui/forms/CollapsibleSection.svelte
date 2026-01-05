<script lang="ts">
	/**
	 * CollapsibleSection Component
	 *
	 * A collapsible section with header and content.
	 * Built on shadcn-svelte Collapsible component.
	 */
	import * as Collapsible from '$lib/components/ui/collapsible';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	interface Props {
		title: string;
		defaultOpen?: boolean;
		class?: string;
		children: import('svelte').Snippet;
	}

	let { title, defaultOpen = true, class: className = '', children }: Props = $props();

	// svelte-ignore state_referenced_locally - defaultOpen is a prop that shouldn't change after init
	let isOpen = $state(defaultOpen);
</script>

<Collapsible.Root bind:open={isOpen} class="border-b border-border {className}">
	<Collapsible.Trigger
		class="flex items-center gap-2 w-full py-3 px-4 text-left hover:bg-secondary/50 transition-colors"
	>
		<ChevronDown
			class="h-4 w-4 text-muted-foreground transition-transform duration-200 {isOpen
				? ''
				: '-rotate-90'}"
		/>
		<span class="text-xs font-semibold uppercase tracking-wider text-foreground">
			{title}
		</span>
	</Collapsible.Trigger>

	<Collapsible.Content class="px-4 pb-4 flex flex-col gap-3">
		{@render children()}
	</Collapsible.Content>
</Collapsible.Root>
