<script lang="ts">
	/**
	 * TextInput Component
	 *
	 * Standard text input with consistent styling.
	 */

	interface Props {
		value: string | null;
		id?: string;
		placeholder?: string;
		disabled?: boolean;
		multiline?: boolean;
		rows?: number;
		onchange?: (value: string | null) => void;
	}

	let {
		value = $bindable(),
		id = '',
		placeholder = '',
		disabled = false,
		multiline = false,
		rows = 3,
		onchange
	}: Props = $props();

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement | HTMLTextAreaElement;
		const newValue = input.value === '' ? null : input.value;
		// Only update local value if using bind:value (no onchange callback)
		// If onchange is provided, the parent controls state via prop
		if (onchange) {
			onchange(newValue);
		} else {
			value = newValue;
		}
	}
</script>

{#if multiline}
	<textarea
		class="text-input"
		{id}
		value={value ?? ''}
		{placeholder}
		{disabled}
		{rows}
		oninput={handleInput}
	></textarea>
{:else}
	<input
		type="text"
		class="text-input"
		{id}
		value={value ?? ''}
		{placeholder}
		{disabled}
		oninput={handleInput}
	/>
{/if}

<style>
	.text-input {
		width: 100%;
		padding: 6px 8px;
		font-size: 12px;
		color: var(--color-text-primary, #fff);
		background: var(--color-bg-tertiary, #1e1e1e);
		border: 1px solid var(--color-border, #444);
		border-radius: 4px;
		outline: none;
		font-family: inherit;
		resize: vertical;
	}

	.text-input:focus {
		border-color: var(--color-accent, #4287f5);
	}

	.text-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.text-input::placeholder {
		color: var(--color-text-muted, #666);
	}

	textarea.text-input {
		min-height: 60px;
	}
</style>
