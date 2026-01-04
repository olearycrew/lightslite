<script lang="ts">
	/**
	 * ColorInput Component
	 *
	 * Color input with text field and preset swatches.
	 * Supports common theatrical gel colors as presets.
	 * Uses Tailwind CSS for styling to align with shadcn-svelte.
	 */
	import { Input } from '$lib/components/ui/input';
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
	// Easter egg: Map of hex colors to their Roscolux names for tooltips
	const ROSCOLUX_NAMES: Record<string, string> = {
		'#ffffff': 'No Color',
		'#ff5555': 'R26 Light Red',
		'#ffa500': 'R21 Golden Amber',
		'#ffff00': 'R12 Straw',
		'#00ff00': 'R89 Moss Green',
		'#0077ff': 'R80 Primary Blue',
		'#aa55ff': 'R57 Lavender',
		'#ff66b2': 'R33 Pink',
		'#ff3300': 'R19 Fire'
	};

	const DEFAULT_PRESETS = Object.keys(ROSCOLUX_NAMES);

	/**
	 * Gets the Roscolux name for a color (easter egg!)
	 * Returns the gel name if it's a known theatrical color, otherwise returns the hex value
	 */
	function getRoscoluxName(color: string): string {
		return ROSCOLUX_NAMES[color.toLowerCase()] ?? color;
	}

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

	let colorPickerRef: HTMLInputElement | undefined = $state();

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
		if (onchange) {
			onchange(input.value);
		} else {
			value = input.value;
		}
	}

	function openColorPicker() {
		if (!disabled && colorPickerRef) {
			colorPickerRef.click();
		}
	}
</script>

<div class="flex flex-col gap-1.5 {className}">
	<div class="flex gap-1 items-center">
		<!-- Combined color swatch and picker - clicking opens native color picker -->
		<button
			type="button"
			class={cn(
				'w-6 h-6 rounded border border-input shrink-0 flex items-center justify-center relative overflow-hidden',
				'hover:border-ring transition-colors cursor-pointer',
				disabled && 'opacity-50 cursor-not-allowed'
			)}
			onclick={openColorPicker}
			{disabled}
			title="Click to pick color"
		>
			{#if value}
				<span class="absolute inset-0 rounded" style:background-color={value}></span>
			{:else}
				<!-- Transparent/no color indicator with checkered background -->
				<span
					class="absolute inset-0 rounded bg-[length:8px_8px] bg-[linear-gradient(45deg,#808080_25%,transparent_25%),linear-gradient(-45deg,#808080_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#808080_75%),linear-gradient(-45deg,transparent_75%,#808080_75%)] bg-[position:0_0,0_4px,4px_-4px,-4px_0px]"
				></span>
				<span class="relative text-xs text-muted-foreground">✕</span>
			{/if}
		</button>

		<!-- Hidden color input that gets triggered by the button -->
		<input
			type="color"
			bind:this={colorPickerRef}
			class="sr-only"
			value={value || '#ffffff'}
			{disabled}
			oninput={handleColorPick}
		/>

		<Input
			type="text"
			{id}
			value={value ?? ''}
			{placeholder}
			{disabled}
			class="h-8 text-xs flex-1 min-w-0"
			oninput={handleInput}
		/>
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
					title={getRoscoluxName(preset)}
				></button>
			{/each}
		</div>
	{/if}
</div>
