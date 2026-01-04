<script lang="ts">
	/**
	 * NumberInput Component
	 *
	 * Number input with optional unit suffix.
	 * Supports min/max/step validation.
	 */

	interface Props {
		value: number | null;
		id?: string;
		placeholder?: string;
		min?: number;
		max?: number;
		step?: number;
		unit?: string;
		disabled?: boolean;
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
		onchange
	}: Props = $props();

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const newValue = input.value === '' ? null : parseFloat(input.value);
		// Only update local value if using bind:value (no onchange callback)
		// If onchange is provided, the parent controls state via prop
		if (onchange) {
			onchange(newValue);
		} else {
			value = newValue;
		}
	}
</script>

<div class="number-input-wrapper">
	<input
		type="number"
		class="number-input"
		{id}
		value={value ?? ''}
		{placeholder}
		{min}
		{max}
		{step}
		{disabled}
		oninput={handleInput}
	/>
	{#if unit}
		<span class="unit">{unit}</span>
	{/if}
</div>

<style>
	.number-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.number-input {
		width: 100%;
		padding: 6px 8px;
		padding-right: var(--unit-padding, 8px);
		font-size: 12px;
		color: var(--color-text-primary, #fff);
		background: var(--color-bg-tertiary, #1e1e1e);
		border: 1px solid var(--color-border, #444);
		border-radius: 4px;
		outline: none;
		font-family: inherit;
		-moz-appearance: textfield;
	}

	.number-input::-webkit-outer-spin-button,
	.number-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.number-input:focus {
		border-color: var(--color-accent, #4287f5);
	}

	.number-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.number-input::placeholder {
		color: var(--color-text-muted, #666);
	}

	.unit {
		position: absolute;
		right: 8px;
		font-size: 10px;
		color: var(--color-text-muted, #666);
		pointer-events: none;
	}

	.number-input-wrapper:has(.unit) .number-input {
		padding-right: 28px;
	}
</style>
