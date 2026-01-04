<script lang="ts" generics="T extends string">
	/**
	 * SelectDropdown Component
	 *
	 * Styled select element with consistent styling.
	 * Built on shadcn-svelte Select component.
	 */
	import * as Select from '$lib/components/ui/select';

	interface Props {
		value: T | null;
		options: Array<{ label: string; value: T }>;
		id?: string;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
		onchange?: (value: T | null) => void;
	}

	let {
		value = $bindable(),
		options,
		id = '',
		placeholder = 'Select...',
		disabled = false,
		class: className = '',
		onchange
	}: Props = $props();

	// Convert value to the format Select expects
	const selectedOption = $derived(options.find((o) => o.value === value));

	function handleChange(newValue: string | undefined) {
		const typedValue = newValue === undefined || newValue === '' ? null : (newValue as T);
		if (onchange) {
			onchange(typedValue);
		} else {
			value = typedValue;
		}
	}
</script>

<Select.Root type="single" value={value ?? undefined} onValueChange={handleChange} {disabled}>
	<Select.Trigger {id} size="sm" class="w-full text-xs {className}">
		<span data-slot="select-value">
			{selectedOption?.label ?? placeholder}
		</span>
	</Select.Trigger>
	<Select.Content>
		{#each options as option (option.value)}
			<Select.Item value={option.value} label={option.label} class="text-xs" />
		{/each}
	</Select.Content>
</Select.Root>
