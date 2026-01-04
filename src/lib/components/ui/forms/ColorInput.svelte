<script lang="ts">
	/**
	 * ColorInput Component
	 *
	 * Color input with text field and preset swatches.
	 * Supports common theatrical gel colors as presets.
	 * Uses Tailwind CSS for styling to align with shadcn-svelte.
	 */
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	interface Props {
		value: string | null;
		id?: string;
		placeholder?: string;
		disabled?: boolean;
		showPresets?: boolean;
		presets?: string[];
		class?: string;
		onchange?: (value: string | null) => void;
	}

	// Common theatrical gel colors (Roscolux numbers with their colors)
	const DEFAULT_PRESETS = [
		'#ffffff', // No Color
		'#ff5555', // R26 Light Red
		'#ffa500', // R21 Golden Amber
		'#ffff00', // R12 Straw
		'#00ff00', // R89 Moss Green
		'#0077ff', // R80 Primary Blue
		'#aa55ff', // R57 Lavender
		'#ff66b2', // R33 Pink
		'#ff3300' // R19 Fire
	];

	let {
		value = $bindable(),
		id = '',
		placeholder = 'e.g., R33, L201',
		disabled = false,
		showPresets = true,
		presets = DEFAULT_PRESETS,
		class: className = '',
		onchange
	}: Props = $props();

	let pickerColor = $state('#ffffff');

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const newValue = input.value === '' ? null : input.value;
		if (onchange) {
			onchange(newValue);
		} else {
			value = newValue;
		}
	}

	function selectPreset(color: string) {
		if (onchange) {
			onchange(color);
		} else {
			value = color;
		}
	}

	function handleColorPick(event: Event) {
		const input = event.target as HTMLInputElement;
		pickerColor = input.value;
		if (onchange) {
			onchange(input.value);
		} else {
			value = input.value;
		}
	}
</script>

<div class="flex flex-col gap-1.5 {className}">
	<div class="flex gap-1 items-center">
		<button
			type="button"
			class={cn(
				'w-6 h-6 rounded border border-input shrink-0 flex items-center justify-center',
				'hover:border-ring transition-colors',
				disabled && 'opacity-50 cursor-not-allowed'
			)}
			style:background-color={value || 'transparent'}
			{disabled}
		>
			{#if !value}
				<span class="text-xs text-muted-foreground">✕</span>
			{/if}
		</button>

		<Input
			type="text"
			{id}
			value={value ?? ''}
			{placeholder}
			{disabled}
			class="h-8 text-xs flex-1 min-w-0"
			oninput={handleInput}
		/>

		<div class="relative">
			<input
				type="color"
				class={cn(
					'w-6 h-6 p-0 rounded border border-input cursor-pointer bg-transparent',
					'[&::-webkit-color-swatch-wrapper]:p-0',
					'[&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded',
					disabled && 'opacity-50 cursor-not-allowed'
				)}
				value={pickerColor}
				{disabled}
				oninput={handleColorPick}
			/>
		</div>
	</div>

	{#if showPresets}
		<div class="flex gap-1 flex-wrap">
			{#each presets as preset (preset)}
				<button
					type="button"
					class={cn(
						'w-5 h-5 rounded border border-input p-0 cursor-pointer',
						'hover:border-muted-foreground transition-colors',
						value === preset && 'border-ring border-2',
						disabled && 'opacity-50 cursor-not-allowed'
					)}
					style:background-color={preset}
					onclick={() => selectPreset(preset)}
					{disabled}
					title={preset}
				></button>
			{/each}
		</div>
	{/if}
</div>
