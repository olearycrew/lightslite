<script lang="ts">
	/**
	 * NumberInput Component
	 *
	 * Number input with optional unit suffix.
	 * Built on shadcn-svelte Input component.
	 */
	import { Input } from '$lib/components/ui/input';

	interface Props {
		value: number | null;
		id?: string;
		placeholder?: string;
		min?: number;
		max?: number;
		step?: number;
		unit?: string;
		disabled?: boolean;
		class?: string;
		onchange?: (value: number | null) => void;
	}

	let {
		value = $bindable(),
		id = '',
		placeholder = '',
		min,
		max,
		step = 1,
		unit = '',
		disabled = false,
		class: className = '',
		onchange
	}: Props = $props();

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const newValue = input.value === '' ? null : parseFloat(input.value);
		if (onchange) {
			onchange(newValue);
		} else {
			value = newValue;
		}
	}
</script>

<div class="relative flex items-center">
	<Input
		type="number"
		{id}
		value={value ?? ''}
		{placeholder}
		{min}
		{max}
		{step}
		{disabled}
		class="h-8 text-xs font-mono {unit
			? 'pr-7'
			: ''} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none {className}"
		oninput={handleInput}
	/>
	{#if unit}
		<span class="absolute right-2 text-[10px] text-muted-foreground pointer-events-none">
			{unit}
		</span>
	{/if}
</div>
