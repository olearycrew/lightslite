<script lang="ts">
	/**
	 * Slider Component
	 *
	 * Range slider with value display.
	 */

	interface Props {
		value: number;
		min?: number;
		max?: number;
		step?: number;
		id?: string;
		disabled?: boolean;
		showValue?: boolean;
		unit?: string;
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
		onchange
	}: Props = $props();

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const newValue = parseFloat(input.value);
		value = newValue;
		onchange?.(newValue);
	}
</script>

<div class="slider-wrapper">
	<input
		type="range"
		class="slider"
		{id}
		{value}
		{min}
		{max}
		{step}
		{disabled}
		oninput={handleInput}
	/>
	{#if showValue}
		<span class="slider-value">
			{value}{unit}
		</span>
	{/if}
</div>

<style>
	.slider-wrapper {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.slider {
		flex: 1;
		height: 4px;
		-webkit-appearance: none;
		appearance: none;
		background: var(--color-bg-tertiary, #1e1e1e);
		border-radius: 2px;
		outline: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--color-accent, #4287f5);
		cursor: pointer;
		border: none;
	}

	.slider::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--color-accent, #4287f5);
		cursor: pointer;
		border: none;
	}

	.slider:disabled {
		opacity: 0.5;
	}

	.slider:disabled::-webkit-slider-thumb {
		cursor: not-allowed;
	}

	.slider:disabled::-moz-range-thumb {
		cursor: not-allowed;
	}

	.slider-value {
		font-size: 12px;
		color: var(--color-text-secondary, #999);
		min-width: 40px;
		text-align: right;
	}
</style>
