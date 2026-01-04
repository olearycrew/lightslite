<script lang="ts">
	/**
	 * Checkbox Component
	 *
	 * Styled checkbox with label.
	 * Built on shadcn-svelte Checkbox component.
	 */
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		checked: boolean;
		label?: string;
		id?: string;
		disabled?: boolean;
		class?: string;
		onchange?: (checked: boolean) => void;
	}

	let {
		checked = $bindable(),
		label = '',
		id = crypto.randomUUID(),
		disabled = false,
		class: className = '',
		onchange
	}: Props = $props();

	function handleChange(newChecked: boolean | 'indeterminate') {
		const boolValue = newChecked === true;
		if (onchange) {
			onchange(boolValue);
		} else {
			checked = boolValue;
		}
	}
</script>

<div class="flex items-center gap-2 {className}">
	<Checkbox
		{id}
		{checked}
		{disabled}
		onCheckedChange={handleChange}
		class="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
	/>
	{#if label}
		<Label for={id} class="text-xs text-muted-foreground cursor-pointer select-none">
			{label}
		</Label>
	{/if}
</div>
