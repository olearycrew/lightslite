<script lang="ts">
	/**
	 * Slider Component
	 *
	 * Range slider with value display.
	 * Built on shadcn-svelte Slider component.
	 */
	import { Slider } from '$lib/components/ui/slider';

	interface Props {
		value: number;
		min?: number;
		max?: number;
		step?: number;
		id?: string;
		disabled?: boolean;
		showValue?: boolean;
		unit?: string;
		class?: string;
		onchange?: (value: number) => void;
	}

	let {
		value = $bindable(),
		min = 0,
		max = 100,
		step = 1,
		id = '',
		disabled = false,
		showValue = true,
		unit = '',
		class: className = '',
		onchange
	}: Props = $props();

	// shadcn Slider uses an array for values
	let sliderValue = $derived([value]);

	function handleChange(newValues: number[]) {
		const newValue = newValues[0] ?? min;
		if (onchange) {
			onchange(newValue);
		} else {
			value = newValue;
		}
	}
</script>

<div class="flex items-center gap-3 {className}">
	<Slider
		{id}
		type="multiple"
		value={sliderValue}
		{min}
		{max}
		{step}
		{disabled}
		class="flex-1"
		onValueChange={handleChange}
	/>
	{#if showValue}
		<span class="text-xs text-muted-foreground min-w-[40px] text-right tabular-nums">
			{value}{unit}
		</span>
	{/if}
</div>
