<script lang="ts">
	/**
	 * ColorInput Component
	 *
	 * Color input with text field and preset swatches.
	 * Supports common theatrical gel colors as presets.
	 */

	interface Props {
		value: string | null;
		id?: string;
		placeholder?: string;
		disabled?: boolean;
		showPresets?: boolean;
		presets?: string[];
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
		onchange
	}: Props = $props();

	let showPicker = $state(false);
	let pickerColor = $state('#ffffff');

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const newValue = input.value === '' ? null : input.value;
		value = newValue;
		onchange?.(newValue);
	}

	function selectPreset(color: string) {
		value = color;
		onchange?.(color);
	}

	function handleColorPick(event: Event) {
		const input = event.target as HTMLInputElement;
		pickerColor = input.value;
		value = input.value;
		onchange?.(input.value);
	}
</script>

<div class="color-input-wrapper">
	<div class="input-row">
		<button
			type="button"
			class="color-preview"
			style:background-color={value || '#transparent'}
			onclick={() => (showPicker = !showPicker)}
			{disabled}
		>
			{#if !value}
				<span class="no-color">✕</span>
			{/if}
		</button>
		<input
			type="text"
			class="color-text"
			{id}
			value={value ?? ''}
			{placeholder}
			{disabled}
			oninput={handleInput}
		/>
		<input
			type="color"
			class="color-picker-native"
			value={pickerColor}
			{disabled}
			oninput={handleColorPick}
		/>
	</div>

	{#if showPresets}
		<div class="presets">
			{#each presets as preset (preset)}
				<button
					type="button"
					class="preset-swatch"
					class:selected={value === preset}
					style:background-color={preset}
					onclick={() => selectPreset(preset)}
					{disabled}
					title={preset}
				></button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.color-input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.input-row {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.color-preview {
		width: 24px;
		height: 24px;
		border: 1px solid var(--color-border, #444);
		border-radius: 4px;
		cursor: pointer;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.color-preview:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.no-color {
		font-size: 12px;
		color: var(--color-text-muted, #666);
	}

	.color-text {
		flex: 1;
		min-width: 0;
		padding: 6px 8px;
		font-size: 12px;
		color: var(--color-text-primary, #fff);
		background: var(--color-bg-tertiary, #1e1e1e);
		border: 1px solid var(--color-border, #444);
		border-radius: 4px;
		outline: none;
		font-family: inherit;
	}

	.color-text:focus {
		border-color: var(--color-accent, #4287f5);
	}

	.color-text:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.color-picker-native {
		width: 24px;
		height: 24px;
		padding: 0;
		border: 1px solid var(--color-border, #444);
		border-radius: 4px;
		cursor: pointer;
		background: none;
	}

	.color-picker-native::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	.color-picker-native::-webkit-color-swatch {
		border: none;
		border-radius: 3px;
	}

	.presets {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	.preset-swatch {
		width: 20px;
		height: 20px;
		border: 1px solid var(--color-border, #444);
		border-radius: 3px;
		cursor: pointer;
		padding: 0;
	}

	.preset-swatch:hover {
		border-color: var(--color-text-secondary, #999);
	}

	.preset-swatch.selected {
		border-color: var(--color-accent, #4287f5);
		border-width: 2px;
	}

	.preset-swatch:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
