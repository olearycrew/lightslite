<script lang="ts">
	/**
	 * TextInput Component
	 *
	 * Standard text input with consistent styling.
	 * Built on shadcn-svelte Input component.
	 */
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';

	interface Props {
		value: string | null;
		id?: string;
		placeholder?: string;
		disabled?: boolean;
		multiline?: boolean;
		rows?: number;
		class?: string;
		onchange?: (value: string | null) => void;
	}

	let {
		value = $bindable(),
		id = '',
		placeholder = '',
		disabled = false,
		multiline = false,
		rows = 3,
		class: className = '',
		onchange
	}: Props = $props();

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement | HTMLTextAreaElement;
		const newValue = input.value === '' ? null : input.value;
		if (onchange) {
			onchange(newValue);
		} else {
			value = newValue;
		}
	}
</script>

{#if multiline}
	<Textarea
		{id}
		value={value ?? ''}
		{placeholder}
		{disabled}
		{rows}
		class="h-auto min-h-[60px] text-xs {className}"
		oninput={handleInput}
	/>
{:else}
	<Input
		type="text"
		{id}
		value={value ?? ''}
		{placeholder}
		{disabled}
		class="h-8 text-xs {className}"
		oninput={handleInput}
	/>
{/if}
