<script lang="ts" generics="T extends string">
	/**
	 * SelectDropdown Component
	 *
	 * Styled select element with consistent styling.
	 */

	interface Props {
		value: T | null;
		options: Array<{ label: string; value: T }>;
		id?: string;
		placeholder?: string;
		disabled?: boolean;
		onchange?: (value: T | null) => void;
	}

	let {
		value = $bindable(),
		options,
		id = '',
		placeholder = 'Select...',
		disabled = false,
		onchange
	}: Props = $props();

	function handleChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newValue = select.value === '' ? null : (select.value as T);
		value = newValue;
		onchange?.(newValue);
	}
</script>

<select class="select-dropdown" {id} {disabled} onchange={handleChange}>
	{#if placeholder}
		<option value="" selected={value === null}>{placeholder}</option>
	{/if}
	{#each options as option (option.value)}
		<option value={option.value} selected={value === option.value}>
			{option.label}
		</option>
	{/each}
</select>

<style>
	.select-dropdown {
		width: 100%;
		padding: 6px 24px 6px 8px;
		font-size: 12px;
		color: var(--color-text-primary, #fff);
		background: var(--color-bg-tertiary, #1e1e1e);
		border: 1px solid var(--color-border, #444);
		border-radius: 4px;
		outline: none;
		font-family: inherit;
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 8px center;
	}

	.select-dropdown:focus {
		border-color: var(--color-accent, #4287f5);
	}

	.select-dropdown:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.select-dropdown option {
		background: var(--color-bg-secondary, #2d2d2d);
		color: var(--color-text-primary, #fff);
	}
</style>
